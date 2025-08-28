const express = require('express');
const { Project, Roll, Mold } = require('../models');
const { authenticateToken, validateInput, checkOwnership, auditLog } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validação para projetos
const projectValidation = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    roll_price: { required: true, type: 'number', min: 0.01, max: 99999.99 },
    roll_length: { required: true, type: 'number', min: 0.1, max: 9999.99 },
    profit_margin: { required: false, type: 'number', min: 0, max: 1000 },
    additional_cost: { required: false, type: 'number', min: 0, max: 99999.99 }
};

// Listar todos os projetos do usuário
router.get('/', auditLog('projects_list'), async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {
            user_id: req.user.id,
            is_active: true
        };

        if (status) {
            whereClause.status = status;
        }

        const { count, rows: projects } = await Project.findAndCountAll({
            where: whereClause,
            order: [['updated_at', 'DESC']],
            limit: parseInt(limit),
            offset,
            include: [{
                model: Roll,
                as: 'roll',
                attributes: ['name', 'width']
            }],
            attributes: [
                'id', 'name', 'roll_price', 'roll_length', 'profit_margin',
                'additional_cost', 'total_cost', 'total_price', 'total_profit',
                'status', 'created_at', 'updated_at'
            ]
        });

        const projectsData = projects.map(project => ({
            id: project.id,
            name: project.name,
            rollName: project.roll?.name || 'N/A',
            rollWidth: project.roll?.width || 0,
            rollPrice: parseFloat(project.roll_price),
            rollLength: parseFloat(project.roll_length),
            profitMargin: parseFloat(project.profit_margin),
            additionalCost: parseFloat(project.additional_cost),
            totalCost: parseFloat(project.total_cost) || 0,
            totalPrice: parseFloat(project.total_price) || 0,
            totalProfit: parseFloat(project.total_profit) || 0,
            status: project.status,
            createdAt: project.created_at,
            updatedAt: project.updated_at
        }));

        res.json({
            success: true,
            projects: projectsData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar projetos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Buscar projeto específico
router.get('/:id', checkOwnership('Project'), async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{
                model: Roll,
                as: 'roll',
                attributes: ['id', 'name', 'width']
            }]
        });

        if (!project) {
            return res.status(404).json({
                error: 'Projeto não encontrado'
            });
        }

        res.json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                roll: project.roll ? {
                    id: project.roll.id,
                    name: project.roll.name,
                    width: parseFloat(project.roll.width)
                } : null,
                rollPrice: parseFloat(project.roll_price),
                rollLength: parseFloat(project.roll_length),
                profitMargin: parseFloat(project.profit_margin),
                additionalCost: parseFloat(project.additional_cost),
                totalCost: parseFloat(project.total_cost) || 0,
                totalPrice: parseFloat(project.total_price) || 0,
                totalProfit: parseFloat(project.total_profit) || 0,
                items: project.items || [],
                calculationData: project.calculation_data || {},
                status: project.status,
                createdAt: project.created_at,
                updatedAt: project.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao buscar projeto:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Criar novo projeto
router.post('/', validateInput(projectValidation), auditLog('project_create'), async (req, res) => {
    try {
        const {
            name,
            roll_id,
            roll_price,
            roll_length,
            profit_margin = 30,
            additional_cost = 0,
            items = []
        } = req.body;

        // Verificar se a bobina pertence ao usuário (se informada)
        if (roll_id) {
            const roll = await Roll.findOne({
                where: {
                    id: roll_id,
                    user_id: req.user.id,
                    is_active: true
                }
            });

            if (!roll) {
                return res.status(400).json({
                    error: 'Bobina não encontrada ou não pertence ao usuário'
                });
            }
        }

        const project = await Project.create({
            user_id: req.user.id,
            name: name.trim(),
            roll_id: roll_id || null,
            roll_price: parseFloat(roll_price),
            roll_length: parseFloat(roll_length),
            profit_margin: parseFloat(profit_margin),
            additional_cost: parseFloat(additional_cost),
            items: items || [],
            status: 'draft'
        });

        // Buscar projeto com relacionamentos
        const projectWithRoll = await Project.findByPk(project.id, {
            include: [{
                model: Roll,
                as: 'roll',
                attributes: ['name', 'width']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Projeto criado com sucesso',
            project: {
                id: projectWithRoll.id,
                name: projectWithRoll.name,
                rollName: projectWithRoll.roll?.name || 'N/A',
                rollPrice: parseFloat(projectWithRoll.roll_price),
                rollLength: parseFloat(projectWithRoll.roll_length),
                profitMargin: parseFloat(projectWithRoll.profit_margin),
                additionalCost: parseFloat(projectWithRoll.additional_cost),
                status: projectWithRoll.status,
                createdAt: projectWithRoll.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Calcular custos do projeto
router.post('/:id/calculate',
    checkOwnership('Project'),
    auditLog('project_calculate'),
    async (req, res) => {
        try {
            const project = req.resource;
            const { items } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    error: 'É necessário informar ao menos um item para o cálculo'
                });
            }

            // Validar que todos os moldes pertencem ao usuário
            const moldIds = items.map(item => item.moldId).filter(Boolean);
            if (moldIds.length > 0) {
                const userMolds = await Mold.findAll({
                    where: {
                        id: moldIds,
                        user_id: req.user.id,
                        is_active: true
                    }
                });

                if (userMolds.length !== moldIds.length) {
                    return res.status(400).json({
                        error: 'Um ou mais moldes não pertencem ao usuário'
                    });
                }
            }

            // Buscar bobina se especificada
            let rollWidth = 0;
            if (project.roll_id) {
                const roll = await Roll.findByPk(project.roll_id);
                if (roll) {
                    rollWidth = parseFloat(roll.width);
                } else {
                    return res.status(400).json({
                        error: 'Bobina associada ao projeto não encontrada'
                    });
                }
            } else {
                return res.status(400).json({
                    error: 'Projeto não possui bobina associada'
                });
            }

            console.log('🔍 Debug - Dados da bobina:', {
                rollWidth,
                rollPrice: parseFloat(project.roll_price),
                rollLength: parseFloat(project.roll_length),
                roll_id: project.roll_id
            });

            // Validar dados básicos (extraindo do projeto)
            const rollPrice = parseFloat(project.roll_price) || 0;
            const rollLength = parseFloat(project.roll_length) || 0;
            const profitMargin = parseFloat(project.profit_margin) || 0;
            const additionalCost = parseFloat(project.additional_cost) || 0;

            // Validar dados básicos
            if (rollPrice <= 0) {
                return res.status(400).json({
                    error: 'Preço da bobina deve ser maior que zero'
                });
            }

            if (rollLength <= 0) {
                return res.status(400).json({
                    error: 'Comprimento da bobina deve ser maior que zero'
                });
            }

            if (rollWidth <= 0) {
                return res.status(400).json({
                    error: 'Largura da bobina deve ser maior que zero'
                });
            }

            // Validar se há itens para calcular
            if (!items || items.length === 0) {
                return res.status(400).json({
                    error: 'Adicione pelo menos um item ao projeto para calcular'
                });
            }

            // Área total dos itens
            let totalArea = 0;
            const calculatedItems = [];

            for (const item of items) {
                const { moldId, quantity } = item;

                if (moldId) {
                    const mold = await Mold.findByPk(moldId);
                    
                    // VALIDAÇÃO: Verificar se o molde cabe na bobina
                    if (parseFloat(mold.width) > rollWidth) {
                        return res.status(400).json({
                            error: `Molde "${mold.name}" (${mold.width}cm de largura) é maior que a largura da bobina (${rollWidth}cm). Use uma bobina mais larga ou um molde menor.`
                        });
                    }
                    
                    const moldArea = parseFloat(mold.width) * parseFloat(mold.height);
                    const itemTotalArea = moldArea * parseInt(quantity);

                    totalArea += itemTotalArea;

                    calculatedItems.push({
                        moldId: mold.id,
                        moldName: mold.name,
                        moldWidth: parseFloat(mold.width),
                        moldHeight: parseFloat(mold.height),
                        moldArea,
                        quantity: parseInt(quantity),
                        totalArea: itemTotalArea
                    });
                }
            }

            // Validar se foi calculada alguma área
            if (totalArea <= 0) {
                return res.status(400).json({
                    error: 'Nenhuma área válida foi calculada. Verifique os moldes e quantidades.'
                });
            }

            // Cálculos
            // rollWidth já está em cm, rollLength deve estar em metros
            // Converter metros para centímetros: rollLength * 100
            const rollTotalArea = rollWidth * (rollLength * 100); // cm × cm = cm²

            console.log('🔍 Debug - Cálculos:', {
                rollWidth,
                rollLength,
                rollTotalArea,
                totalArea
            });

            // Verificar se temos área válida para evitar divisão por zero
            if (rollTotalArea <= 0) {
                return res.status(400).json({
                    error: 'Área da bobina inválida. Verifique largura e comprimento.'
                });
            }

            const costPerCm2 = rollPrice / rollTotalArea;
            const materialCost = totalArea * costPerCm2;
            const totalCost = materialCost + additionalCost;
            const totalPrice = totalCost * (1 + profitMargin / 100);
            const totalProfit = totalPrice - totalCost;

            console.log('🔍 Debug - Resultados:', {
                costPerCm2,
                materialCost,
                totalCost,
                totalPrice,
                totalProfit
            });

            const calculationData = {
                rollWidth,
                rollTotalArea,
                costPerCm2,
                materialCost,
                totalArea,
                calculatedItems,
                calculatedAt: new Date().toISOString()
            };

            // Validar se os cálculos são válidos
            if (!isFinite(totalCost) || !isFinite(totalPrice) || !isFinite(totalProfit)) {
                console.error('Cálculos inválidos:', { totalCost, totalPrice, totalProfit, rollTotalArea, costPerCm2 });
                return res.status(400).json({
                    error: 'Erro nos cálculos. Verifique os dados da bobina e moldes.'
                });
            }

            // Atualizar projeto
            await project.update({
                items: calculatedItems,
                total_cost: totalCost,
                total_price: totalPrice,
                total_profit: totalProfit,
                calculation_data: calculationData,
                status: 'calculated'
            });

            res.json({
                success: true,
                message: 'Cálculo realizado com sucesso',
                calculation: {
                    totalArea: totalArea.toFixed(2),
                    materialCost: materialCost.toFixed(2),
                    totalCost: totalCost.toFixed(2),
                    totalPrice: totalPrice.toFixed(2),
                    totalProfit: totalProfit.toFixed(2),
                    costPerCm2: costPerCm2.toFixed(4),
                    items: calculatedItems
                }
            });

        } catch (error) {
            console.error('Erro ao calcular projeto:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// Atualizar projeto
router.put('/:id',
    checkOwnership('Project'),
    validateInput(projectValidation),
    auditLog('project_update'),
    async (req, res) => {
        try {
            const project = req.resource;
            const {
                name,
                roll_id,
                roll_price,
                roll_length,
                profit_margin,
                additional_cost
            } = req.body;

            // Verificar se a bobina pertence ao usuário (se informada)
            if (roll_id) {
                const roll = await Roll.findOne({
                    where: {
                        id: roll_id,
                        user_id: req.user.id,
                        is_active: true
                    }
                });

                if (!roll) {
                    return res.status(400).json({
                        error: 'Bobina não encontrada ou não pertence ao usuário'
                    });
                }
            }

            await project.update({
                name: name.trim(),
                roll_id: roll_id || null,
                roll_price: parseFloat(roll_price),
                roll_length: parseFloat(roll_length),
                profit_margin: parseFloat(profit_margin),
                additional_cost: parseFloat(additional_cost),
                status: 'draft' // Reset status when updating
            });

            res.json({
                success: true,
                message: 'Projeto atualizado com sucesso',
                project: {
                    id: project.id,
                    name: project.name,
                    rollPrice: parseFloat(project.roll_price),
                    rollLength: parseFloat(project.roll_length),
                    profitMargin: parseFloat(project.profit_margin),
                    additionalCost: parseFloat(project.additional_cost),
                    status: project.status,
                    updatedAt: project.updated_at
                }
            });

        } catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// Deletar projeto (soft delete)
router.delete('/:id',
    checkOwnership('Project'),
    auditLog('project_delete'),
    async (req, res) => {
        try {
            const project = req.resource;

            await project.update({
                is_active: false
            });

            res.json({
                success: true,
                message: 'Projeto removido com sucesso'
            });

        } catch (error) {
            console.error('Erro ao deletar projeto:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// Estatísticas dos projetos
router.get('/stats/overview', auditLog('projects_stats'), async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: {
                user_id: req.user.id,
                is_active: true
            },
            attributes: ['status', 'total_cost', 'total_price', 'total_profit', 'created_at']
        });

        const stats = {
            total: projects.length,
            byStatus: {
                draft: 0,
                calculated: 0,
                completed: 0
            },
            totalCost: 0,
            totalRevenue: 0,
            totalProfit: 0,
            averageProfit: 0,
            monthlyStats: {}
        };

        let calculatedProjects = 0;

        projects.forEach(project => {
            stats.byStatus[project.status]++;

            if (project.status === 'calculated' || project.status === 'completed') {
                stats.totalCost += parseFloat(project.total_cost) || 0;
                stats.totalRevenue += parseFloat(project.total_price) || 0;
                stats.totalProfit += parseFloat(project.total_profit) || 0;
                calculatedProjects++;

                // Estatísticas mensais
                const month = new Date(project.created_at).toISOString().slice(0, 7);
                if (!stats.monthlyStats[month]) {
                    stats.monthlyStats[month] = {
                        count: 0,
                        totalProfit: 0
                    };
                }
                stats.monthlyStats[month].count++;
                stats.monthlyStats[month].totalProfit += parseFloat(project.total_profit) || 0;
            }
        });

        if (calculatedProjects > 0) {
            stats.averageProfit = stats.totalProfit / calculatedProjects;
        }

        res.json({
            success: true,
            stats: {
                ...stats,
                totalCost: stats.totalCost.toFixed(2),
                totalRevenue: stats.totalRevenue.toFixed(2),
                totalProfit: stats.totalProfit.toFixed(2),
                averageProfit: stats.averageProfit.toFixed(2)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
