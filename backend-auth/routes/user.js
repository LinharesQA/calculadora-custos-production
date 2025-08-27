const express = require('express');
const { User, Mold, Roll, Project } = require('../models');
const { authenticateToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Obter dados do usuário com estatísticas
router.get('/dashboard', auditLog('dashboard_view'), async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar estatísticas do usuário
        const [moldsCount, rollsCount, projectsCount] = await Promise.all([
            Mold.count({ where: { user_id: userId, is_active: true } }),
            Roll.count({ where: { user_id: userId, is_active: true } }),
            Project.count({ where: { user_id: userId, is_active: true } })
        ]);

        // Calcular economia total (soma dos lucros dos projetos)
        const projects = await Project.findAll({
            where: {
                user_id: userId,
                is_active: true,
                status: 'calculated'
            },
            attributes: ['total_profit']
        });

        const totalEconomy = projects.reduce((sum, project) => {
            return sum + (parseFloat(project.total_profit) || 0);
        }, 0);

        // Projetos recentes
        const recentProjects = await Project.findAll({
            where: { user_id: userId, is_active: true },
            order: [['updated_at', 'DESC']],
            limit: 5,
            include: [{
                model: Roll,
                as: 'roll',
                attributes: ['name']
            }]
        });

        res.json({
            success: true,
            stats: {
                totalMolds: moldsCount,
                totalRolls: rollsCount,
                totalProjects: projectsCount,
                totalEconomy: totalEconomy.toFixed(2)
            },
            recentProjects: recentProjects.map(project => ({
                id: project.id,
                name: project.name,
                rollName: project.roll?.name || 'N/A',
                totalPrice: project.total_price,
                status: project.status,
                updatedAt: project.updated_at
            }))
        });

    } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Obter perfil do usuário
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'avatar', 'last_login', 'created_at']
        });

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                lastLogin: user.last_login,
                memberSince: user.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Exportar todos os dados do usuário (LGPD compliance)
router.get('/export', auditLog('data_export'), async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar todos os dados do usuário
        const [user, molds, rolls, projects] = await Promise.all([
            User.findByPk(userId, {
                attributes: { exclude: ['google_id'] }
            }),
            Mold.findAll({ where: { user_id: userId } }),
            Roll.findAll({ where: { user_id: userId } }),
            Project.findAll({
                where: { user_id: userId },
                include: [{
                    model: Roll,
                    as: 'roll',
                    attributes: ['name']
                }]
            })
        ]);

        const exportData = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                memberSince: user.created_at,
                lastLogin: user.last_login
            },
            molds: molds.map(mold => ({
                id: mold.id,
                name: mold.name,
                width: mold.width,
                height: mold.height,
                createdAt: mold.created_at
            })),
            rolls: rolls.map(roll => ({
                id: roll.id,
                name: roll.name,
                width: roll.width,
                createdAt: roll.created_at
            })),
            projects: projects.map(project => ({
                id: project.id,
                name: project.name,
                rollName: project.roll?.name,
                rollPrice: project.roll_price,
                rollLength: project.roll_length,
                profitMargin: project.profit_margin,
                additionalCost: project.additional_cost,
                totalCost: project.total_cost,
                totalPrice: project.total_price,
                totalProfit: project.total_profit,
                items: project.items,
                status: project.status,
                createdAt: project.created_at
            })),
            exportedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            data: exportData
        });

    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Atualizar configurações do usuário
router.put('/settings', async (req, res) => {
    try {
        const { name } = req.body;
        const user = req.user;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                error: 'Nome deve ter pelo menos 2 caracteres'
            });
        }

        await user.update({
            name: name.trim()
        });

        res.json({
            success: true,
            message: 'Configurações atualizadas com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
