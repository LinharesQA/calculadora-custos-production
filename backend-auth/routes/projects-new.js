const express = require('express');
const { Project, Roll, Mold } = require('../models');
const { authenticateToken, validateInput, checkOwnership, auditLog } = require('../middleware/auth');
const CalculationEngine = require('../utils/calculation-engine');

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
        const projects = await Project.findAll({
            where: {
                user_id: req.user.id,
                is_active: true
            },
            include: [
                {
                    model: Roll,
                    as: 'roll',
                    attributes: ['id', 'name', 'width']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0
        });

        const totalCount = await Project.count({
            where: {
                user_id: req.user.id,
                is_active: true
            }
        });

        res.json({
            projects: projects.map(project => ({
                id: project.id,
                name: project.name,
                status: project.status,
                rollName: project.roll?.name || 'Bobina não definida',
                rollWidth: project.roll?.width || 0,
                totalCost: project.total_cost,
                totalPrice: project.total_price,
                totalProfit: project.total_profit,
                createdAt: project.created_at,
                updatedAt: project.updated_at
            })),
            pagination: {
                total: totalCount,
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0
            }
        });
    } catch (error) {
        console.error('Erro ao listar projetos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Obter um projeto específico
router.get('/:id', checkOwnership('Project'), auditLog('project_view'), async (req, res) => {
    try {
        const project = req.resource;

        const projectData = {
            id: project.id,
            name: project.name,
            status: project.status,
            rollId: project.roll_id,
            rollPrice: project.roll_price,
            rollLength: project.roll_length,
            profitMargin: project.profit_margin,
            additionalCost: project.additional_cost,
            totalCost: project.total_cost,
            totalPrice: project.total_price,
            totalProfit: project.total_profit,
            items: project.items,
            calculationData: project.calculation_data,
            createdAt: project.created_at,
            updatedAt: project.updated_at
        };

        if (project.roll) {
            projectData.roll = {
                id: project.roll.id,
                name: project.roll.name,
                width: project.roll.width
            };
        }

        res.json({ project: projectData });
    } catch (error) {
        console.error('Erro ao obter projeto:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Criar novo projeto
router.post('/',
    validateInput(projectValidation),
    auditLog('project_create'),
    async (req, res) => {
        try {
            const {
                name,
                roll_id,
                roll_price,
                roll_length,
                profit_margin = 30,
                additional_cost = 0
            } = req.body;

            // Verificar se a bobina pertence ao usuário (se especificada)
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
                name: name.trim(),
                user_id: req.user.id,
                roll_id: roll_id || null,
                roll_price: parseFloat(roll_price),
                roll_length: parseFloat(roll_length),
                profit_margin: parseFloat(profit_margin),
                additional_cost: parseFloat(additional_cost),
                status: 'draft'
            });

            res.status(201).json({
                message: 'Projeto criado com sucesso',
                project: {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    rollId: project.roll_id,
                    rollPrice: project.roll_price,
                    rollLength: project.roll_length,
                    profitMargin: project.profit_margin,
                    additionalCost: project.additional_cost,
                    createdAt: project.created_at
                }
            });
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

// 🧮 CALCULAR CUSTOS DO PROJETO - VERSÃO ROBUSTA
router.post('/:id/calculate',
    checkOwnership('Project'),
    auditLog('project_calculate'),
    async (req, res) => {
        try {
            const project = req.resource;
            const { items } = req.body;

            console.log('🧮 Iniciando cálculo robusto...');

            // Buscar dados da bobina
            const roll = await Roll.findByPk(project.roll_id);
            if (!roll) {
                return res.status(400).json({
                    error: 'Bobina não encontrada'
                });
            }

            // Buscar moldes
            const moldIds = items.map(item => item.moldId);
            const molds = await Mold.findAll({
                where: {
                    id: moldIds,
                    user_id: req.user.id,
                    is_active: true
                }
            });

            const moldMap = molds.reduce((map, mold) => {
                map[mold.id] = mold;
                return map;
            }, {});

            // Preparar dados para o motor de cálculo
            const calculationData = {
                rollWidth: parseFloat(roll.width), // já em metros
                rollLength: parseFloat(project.roll_length),
                rollPrice: parseFloat(project.roll_price),
                profitMargin: parseFloat(project.profit_margin),
                additionalCost: parseFloat(project.additional_cost),
                items: items.map(item => {
                    const mold = moldMap[item.moldId];
                    if (!mold) {
                        throw new Error(`Molde não encontrado: ${item.moldId}`);
                    }
                    return {
                        mold: {
                            id: mold.id,
                            name: mold.name,
                            width: parseFloat(mold.width), // já em metros
                            height: parseFloat(mold.height) // já em metros
                        },
                        quantity: parseInt(item.quantity)
                    };
                })
            };

            // 🚀 USAR MOTOR DE CÁLCULO ROBUSTO
            const calculationResult = CalculationEngine.calculate(calculationData);

            // Atualizar projeto no banco
            await project.update({
                items: calculationResult.items,
                total_cost: calculationResult.totalCostWithAdditional,
                total_price: calculationResult.totalSellPrice,
                total_profit: calculationResult.totalProfit,
                calculation_data: calculationResult,
                status: 'calculated'
            });

            console.log('✅ Cálculo salvo no projeto');

            res.json({
                success: true,
                message: 'Cálculo realizado com sucesso',
                calculations: {
                    totalPieces: calculationResult.totalPieces,
                    totalLengthNeeded: parseFloat(calculationResult.totalLengthNeeded.toFixed(2)),
                    totalRollAreaUsed: parseFloat(calculationResult.totalRollAreaUsed.toFixed(4)),
                    totalMoldArea: parseFloat(calculationResult.totalMoldArea.toFixed(4)),
                    totalPaperCost: parseFloat(calculationResult.totalPaperCost.toFixed(2)),
                    totalCostWithAdditional: parseFloat(calculationResult.totalCostWithAdditional.toFixed(2)),
                    costPerPiece: parseFloat(calculationResult.costPerPiece.toFixed(2)),
                    sellPricePerPiece: parseFloat(calculationResult.sellPricePerPiece.toFixed(2)),
                    totalSellPrice: parseFloat(calculationResult.totalSellPrice.toFixed(2)),
                    totalProfit: parseFloat(calculationResult.totalProfit.toFixed(2)),
                    items: calculationResult.items
                }
            });

        } catch (error) {
            console.error('❌ Erro no cálculo:', error);
            res.status(400).json({
                error: error.message
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
                message: 'Projeto atualizado com sucesso',
                project: {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    rollId: project.roll_id,
                    rollPrice: project.roll_price,
                    rollLength: project.roll_length,
                    profitMargin: project.profit_margin,
                    additionalCost: project.additional_cost,
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

// Deletar projeto
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
                message: 'Projeto removido com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover projeto:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
);

module.exports = router;
