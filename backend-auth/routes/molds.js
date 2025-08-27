const express = require('express');
const { Mold } = require('../models');
const { authenticateToken, validateInput, checkOwnership, auditLog } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validação para moldes
const moldValidation = {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    width: { required: true, type: 'number', min: 0.1, max: 999.99 },
    height: { required: true, type: 'number', min: 0.1, max: 999.99 }
};

// Listar todos os moldes do usuário
router.get('/', auditLog('molds_list'), async (req, res) => {
    try {
        const molds = await Mold.findAll({
            where: {
                user_id: req.user.id,
                is_active: true
            },
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'width', 'height', 'created_at', 'updated_at']
        });

        const moldsWithArea = molds.map(mold => ({
            id: mold.id,
            name: mold.name,
            width: parseFloat(mold.width),
            height: parseFloat(mold.height),
            area: parseFloat(mold.width) * parseFloat(mold.height),
            createdAt: mold.created_at,
            updatedAt: mold.updated_at
        }));

        res.json({
            success: true,
            molds: moldsWithArea,
            total: moldsWithArea.length
        });

    } catch (error) {
        console.error('Erro ao listar moldes:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Buscar molde específico
router.get('/:id', checkOwnership('Mold'), async (req, res) => {
    try {
        const mold = req.resource;

        res.json({
            success: true,
            mold: {
                id: mold.id,
                name: mold.name,
                width: parseFloat(mold.width),
                height: parseFloat(mold.height),
                area: parseFloat(mold.width) * parseFloat(mold.height),
                createdAt: mold.created_at,
                updatedAt: mold.updated_at
            }
        });

    } catch (error) {
        console.error('Erro ao buscar molde:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Criar novo molde
router.post('/', validateInput(moldValidation), auditLog('mold_create'), async (req, res) => {
    try {
        const { name, width, height } = req.body;

        // Verificar se já existe molde com mesmo nome para o usuário
        const existingMold = await Mold.findOne({
            where: {
                user_id: req.user.id,
                name: name.trim(),
                is_active: true
            }
        });

        if (existingMold) {
            return res.status(400).json({
                error: 'Já existe um molde com este nome'
            });
        }

        const mold = await Mold.create({
            user_id: req.user.id,
            name: name.trim(),
            width: parseFloat(width),
            height: parseFloat(height)
        });

        res.status(201).json({
            success: true,
            message: 'Molde criado com sucesso',
            mold: {
                id: mold.id,
                name: mold.name,
                width: parseFloat(mold.width),
                height: parseFloat(mold.height),
                area: parseFloat(mold.width) * parseFloat(mold.height),
                createdAt: mold.created_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar molde:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Atualizar molde
router.put('/:id',
    checkOwnership('Mold'),
    validateInput(moldValidation),
    auditLog('mold_update'),
    async (req, res) => {
        try {
            const { name, width, height } = req.body;
            const mold = req.resource;

            // Verificar se já existe outro molde com mesmo nome
            const existingMold = await Mold.findOne({
                where: {
                    user_id: req.user.id,
                    name: name.trim(),
                    is_active: true,
                    id: { [require('sequelize').Op.ne]: mold.id }
                }
            });

            if (existingMold) {
                return res.status(400).json({
                    error: 'Já existe outro molde com este nome'
                });
            }

            await mold.update({
                name: name.trim(),
                width: parseFloat(width),
                height: parseFloat(height)
            });

            res.json({
                success: true,
                message: 'Molde atualizado com sucesso',
                mold: {
                    id: mold.id,
                    name: mold.name,
                    width: parseFloat(mold.width),
                    height: parseFloat(mold.height),
                    area: parseFloat(mold.width) * parseFloat(mold.height),
                    updatedAt: mold.updated_at
                }
            });

        } catch (error) {
            console.error('Erro ao atualizar molde:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// Deletar molde (soft delete)
router.delete('/:id',
    checkOwnership('Mold'),
    auditLog('mold_delete'),
    async (req, res) => {
        try {
            const mold = req.resource;

            await mold.update({
                is_active: false
            });

            res.json({
                success: true,
                message: 'Molde removido com sucesso'
            });

        } catch (error) {
            console.error('Erro ao deletar molde:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// Estatísticas dos moldes
router.get('/stats/overview', auditLog('molds_stats'), async (req, res) => {
    try {
        const molds = await Mold.findAll({
            where: {
                user_id: req.user.id,
                is_active: true
            },
            attributes: ['name', 'width', 'height']
        });

        const stats = {
            total: molds.length,
            averageArea: 0,
            largestArea: 0,
            smallestArea: 0,
            areaDistribution: {}
        };

        if (molds.length > 0) {
            const areas = molds.map(mold => parseFloat(mold.width) * parseFloat(mold.height));

            stats.averageArea = areas.reduce((sum, area) => sum + area, 0) / areas.length;
            stats.largestArea = Math.max(...areas);
            stats.smallestArea = Math.min(...areas);

            // Distribuição por faixas de área
            const ranges = [
                { min: 0, max: 100, label: 'Pequeno (0-100 cm²)' },
                { min: 100, max: 500, label: 'Médio (100-500 cm²)' },
                { min: 500, max: 1000, label: 'Grande (500-1000 cm²)' },
                { min: 1000, max: Infinity, label: 'Extra Grande (>1000 cm²)' }
            ];

            ranges.forEach(range => {
                const count = areas.filter(area => area >= range.min && area < range.max).length;
                stats.areaDistribution[range.label] = count;
            });
        }

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
