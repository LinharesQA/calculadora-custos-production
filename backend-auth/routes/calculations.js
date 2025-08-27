const express = require('express');
const { Project, Mold, Roll } = require('../models');
const { authenticateToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Algoritmo de otimização de corte
class CuttingOptimizer {
    static optimize(items, rollWidth) {
        // Algoritmo simples de bin packing
        let layouts = [];
        let currentLayout = [];
        let currentRowWidth = 0;
        let currentRowHeight = 0;
        let totalHeight = 0;

        // Ordenar itens por altura decrescente para melhor empacotamento
        const sortedItems = [...items].sort((a, b) => b.height - a.height);

        for (const item of sortedItems) {
            for (let i = 0; i < item.quantity; i++) {
                // Verificar se o item cabe na linha atual
                if (currentRowWidth + item.width <= rollWidth) {
                    currentLayout.push({
                        ...item,
                        x: currentRowWidth,
                        y: totalHeight,
                        id: `${item.moldId}_${i}`
                    });
                    currentRowWidth += item.width;
                    currentRowHeight = Math.max(currentRowHeight, item.height);
                } else {
                    // Nova linha
                    totalHeight += currentRowHeight;
                    layouts.push({
                        items: [...currentLayout],
                        height: currentRowHeight,
                        width: rollWidth,
                        efficiency: (currentRowWidth / rollWidth) * 100
                    });

                    currentLayout = [{
                        ...item,
                        x: 0,
                        y: totalHeight,
                        id: `${item.moldId}_${i}`
                    }];
                    currentRowWidth = item.width;
                    currentRowHeight = item.height;
                }
            }
        }

        // Adicionar última linha se houver
        if (currentLayout.length > 0) {
            totalHeight += currentRowHeight;
            layouts.push({
                items: [...currentLayout],
                height: currentRowHeight,
                width: rollWidth,
                efficiency: (currentRowWidth / rollWidth) * 100
            });
        }

        const totalArea = layouts.reduce((sum, layout) => sum + (layout.width * layout.height), 0);
        const usedArea = items.reduce((sum, item) => sum + (item.width * item.height * item.quantity), 0);
        const overallEfficiency = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;

        return {
            layouts,
            totalHeight,
            totalArea,
            usedArea,
            wastedArea: totalArea - usedArea,
            efficiency: overallEfficiency,
            rollsNeeded: Math.ceil(totalHeight / 100) // Assumindo rolos de 100cm
        };
    }
}

// Endpoint para calcular projeto
router.post('/:projectId/calculate', auditLog('project_calculate'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { items } = req.body;
        const userId = req.user.id;

        // Buscar projeto
        const project = await Project.findOne({
            where: {
                id: projectId,
                user_id: userId,
                is_active: true
            },
            include: [{ model: Roll, as: 'roll' }]
        });

        if (!project) {
            return res.status(404).json({
                error: 'Projeto não encontrado'
            });
        }

        // Buscar dados dos moldes
        const moldIds = items.map(item => item.moldId);
        const molds = await Mold.findAll({
            where: {
                id: moldIds,
                user_id: userId,
                is_active: true
            }
        });

        const moldMap = molds.reduce((map, mold) => {
            map[mold.id] = mold;
            return map;
        }, {});

        // Preparar dados para otimização
        const optimizationItems = items.map(item => {
            const mold = moldMap[item.moldId];
            if (!mold) {
                throw new Error(`Molde não encontrado: ${item.moldId}`);
            }
            return {
                moldId: item.moldId,
                width: mold.width,
                height: mold.height,
                quantity: item.quantity,
                name: mold.name
            };
        });

        // Executar otimização
        const rollWidth = project.roll.width;
        const optimization = CuttingOptimizer.optimize(optimizationItems, rollWidth);

        // Calcular custos
        const rollPricePerCm2 = project.roll_price / (project.roll_length * rollWidth);
        const materialCost = optimization.totalArea * rollPricePerCm2;
        const additionalCost = project.additional_cost || 0;
        const totalCost = materialCost + additionalCost;
        const profitMargin = project.profit_margin || 30;
        const totalPrice = totalCost * (1 + profitMargin / 100);
        const totalProfit = totalPrice - totalCost;

        const calculationResults = {
            optimization,
            costs: {
                materialCost: parseFloat(materialCost.toFixed(2)),
                additionalCost: parseFloat(additionalCost.toFixed(2)),
                totalCost: parseFloat(totalCost.toFixed(2)),
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                costPerCm2: parseFloat(rollPricePerCm2.toFixed(4)),
                profitMargin: profitMargin
            },
            summary: {
                totalArea: optimization.totalArea,
                usedArea: optimization.usedArea,
                wastedArea: optimization.wastedArea,
                efficiency: parseFloat(optimization.efficiency.toFixed(2)),
                rollsNeeded: optimization.rollsNeeded
            }
        };

        // Atualizar projeto com resultados
        await project.update({
            status: 'calculated',
            total_cost: totalCost,
            total_price: totalPrice,
            total_profit: totalProfit,
            calculation_data: calculationResults,
            items: items,
            updated_at: new Date()
        });

        res.json({
            success: true,
            calculation: calculationResults
        });

    } catch (error) {
        console.error('Erro ao calcular projeto:', error);
        res.status(500).json({
            error: error.message || 'Erro interno do servidor'
        });
    }
});

module.exports = router;
