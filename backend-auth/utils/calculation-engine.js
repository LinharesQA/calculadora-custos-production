// 🧮 MOTOR DE CÁLCULO ROBUSTO - SublimaCalc
// Sistema de cálculo com validações completas contra infinito/NaN

class CalculationEngine {

    /**
     * Valida se um número é válido e finito
     */
    static isValidNumber(value) {
        return typeof value === 'number' &&
            isFinite(value) &&
            !isNaN(value) &&
            value >= 0;
    }

    /**
     * Valida entrada básica do cálculo
     */
    static validateInput(data) {
        console.log('🔍 Validando dados recebidos:', data);
        console.log('📊 Valores individuais:');
        console.log('- rollWidth:', data.rollWidth, typeof data.rollWidth);
        console.log('- rollLength:', data.rollLength, typeof data.rollLength);
        console.log('- rollPrice:', data.rollPrice, typeof data.rollPrice);
        console.log('- profitMargin:', data.profitMargin, typeof data.profitMargin);
        console.log('- additionalCost:', data.additionalCost, typeof data.additionalCost);
        console.log('- items:', data.items, Array.isArray(data.items));

        const { rollWidth, rollLength, rollPrice, profitMargin, additionalCost, items } = data;

        const errors = [];

        // Validações básicas: campo vazio, número negativo, número 0
        if (rollWidth === null || rollWidth === undefined || rollWidth === '' || isNaN(rollWidth)) {
            errors.push('Largura da bobina está vazia');
        } else if (rollWidth <= 0) {
            errors.push('Largura da bobina deve ser maior que zero');
        }

        if (rollLength === null || rollLength === undefined || rollLength === '' || isNaN(rollLength)) {
            errors.push('Comprimento da bobina está vazio');
        } else if (rollLength <= 0) {
            errors.push('Comprimento da bobina deve ser maior que zero');
        }

        if (rollPrice === null || rollPrice === undefined || rollPrice === '' || isNaN(rollPrice)) {
            errors.push('Preço da bobina está vazio');
        } else if (rollPrice <= 0) {
            errors.push('Preço da bobina deve ser maior que zero');
        }

        // Margem e custo adicional podem ser 0, apenas não podem ser negativos
        if (profitMargin < 0) {
            errors.push('Margem de lucro não pode ser negativa');
        }

        if (additionalCost < 0) {
            errors.push('Custo adicional não pode ser negativo');
        }

        if (!Array.isArray(items) || items.length === 0) {
            errors.push('Deve haver pelo menos um item para calcular');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifica se molde cabe na bobina
     */
    static validateMoldFitsInRoll(moldWidth, rollWidth, moldName) {
        // moldWidth já está em cm (não converter)
        if (moldWidth > rollWidth) {
            throw new Error(
                `Molde "${moldName}" (${moldWidth}cm) é maior que a bobina (${rollWidth}cm). ` +
                `Use uma bobina mais larga ou um molde menor.`
            );
        }

        return moldWidth;
    }

    /**
     * Calcula otimização de moldes em uma bobina
     */
    static calculateMoldOptimization(moldWidth, moldHeight, quantity, rollWidth) {
        console.log('🔧 calculateMoldOptimization - Parâmetros recebidos:', {
            moldWidth, moldHeight, quantity, rollWidth
        });

        // Validar se os parâmetros existem
        if (moldWidth === undefined || moldWidth === null) {
            throw new Error('moldWidth is not defined na função calculateMoldOptimization');
        }
        if (moldHeight === undefined || moldHeight === null) {
            throw new Error('moldHeight is not defined na função calculateMoldOptimization');
        }
        if (quantity === undefined || quantity === null) {
            throw new Error('quantity is not defined na função calculateMoldOptimization');
        }
        if (rollWidth === undefined || rollWidth === null) {
            throw new Error('rollWidth is not defined na função calculateMoldOptimization');
        }

        // moldWidth já está em cm (não converter)
        // Quantos moldes cabem na largura
        const moldsAcross = Math.floor(rollWidth / moldWidth);

        if (moldsAcross <= 0) {
            throw new Error(`Impossível calcular: molde ${moldWidth}cm não cabe na bobina ${rollWidth}cm`);
        }

        // Quantas linhas são necessárias
        const totalRows = Math.ceil(quantity / moldsAcross);

        // Comprimento necessário (converter altura de cm para metros)
        const lengthNeeded = totalRows * (moldHeight / 100);

        // Área do molde em m² (converter de cm² para m²)
        const moldAreaM2 = (moldWidth * moldHeight) / 10000;
        const totalMoldArea = moldAreaM2 * quantity;

        // Validar resultados
        if (!this.isValidNumber(moldsAcross) ||
            !this.isValidNumber(totalRows) ||
            !this.isValidNumber(lengthNeeded) ||
            !this.isValidNumber(totalMoldArea)) {
            throw new Error('Erro nos cálculos de otimização. Verifique as dimensões.');
        }

        return {
            moldsAcross,
            totalRows,
            lengthNeeded,
            moldAreaM2,
            totalMoldArea
        };
    }

    /**
     * Calcula custos finais
     */
    static calculateCosts(totalLengthNeeded, rollWidth, rollPrice, rollLength, additionalCost, profitMargin, totalPieces) {
        // Área da bobina utilizada em m²
        const totalRollAreaUsed = totalLengthNeeded * (rollWidth / 100);

        // Custo por metro
        const paperCostPerMeter = rollPrice / rollLength;

        // Custo total do papel
        const totalPaperCost = totalLengthNeeded * paperCostPerMeter;

        // Custo total com adicionais
        const totalCostWithAdditional = totalPaperCost + additionalCost;

        // Custo por peça
        const costPerPiece = totalCostWithAdditional / totalPieces;

        // Preços de venda
        const sellPricePerPiece = costPerPiece * (1 + profitMargin / 100);
        const totalSellPrice = sellPricePerPiece * totalPieces;
        const totalProfit = totalSellPrice - totalCostWithAdditional;

        // Validar todos os resultados
        const results = {
            totalRollAreaUsed,
            paperCostPerMeter,
            totalPaperCost,
            totalCostWithAdditional,
            costPerPiece,
            sellPricePerPiece,
            totalSellPrice,
            totalProfit
        };

        for (const [key, value] of Object.entries(results)) {
            if (!this.isValidNumber(value)) {
                throw new Error(`Erro no cálculo de ${key}: resultado inválido (${value})`);
            }
        }

        return results;
    }

    /**
     * Executa cálculo completo com todas as validações
     */
    static calculate(data) {
        try {
            // 1. Validar entrada
            const validation = this.validateInput(data);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('; '));
            }

            const { rollWidth, rollLength, rollPrice, profitMargin, additionalCost, items } = data;

            // rollWidth já está em cm
            // Quantos moldes cabem na largura
            const moldsAcross = Math.floor(rollWidth / moldWidth);

            let totalLengthNeeded = 0;
            let totalPieces = 0;
            let totalMoldArea = 0;
            const calculatedItems = [];

            // 2. Processar cada item
            for (const item of items) {
                const { mold, quantity } = item;

                // Validar quantidade: campo vazio, zero ou negativo
                if (quantity === null || quantity === undefined || quantity === '' || isNaN(quantity)) {
                    throw new Error(`Quantidade está vazia para o molde "${mold?.name || 'desconhecido'}"`);
                }
                if (quantity <= 0) {
                    throw new Error(`Quantidade deve ser maior que zero para o molde "${mold?.name || 'desconhecido'}"`);
                }

                // Validar se molde existe
                if (!mold) {
                    throw new Error('Molde não encontrado');
                }

                // Validar dimensões do molde: campo vazio, zero ou negativo
                if (mold.width === null || mold.width === undefined || mold.width === '' || isNaN(mold.width)) {
                    throw new Error(`Largura do molde "${mold.name}" está vazia`);
                }
                if (mold.width <= 0) {
                    throw new Error(`Largura do molde "${mold.name}" deve ser maior que zero`);
                }

                if (mold.height === null || mold.height === undefined || mold.height === '' || isNaN(mold.height)) {
                    throw new Error(`Altura do molde "${mold.name}" está vazia`);
                }
                if (mold.height <= 0) {
                    throw new Error(`Altura do molde "${mold.name}" deve ser maior que zero`);
                }

                // ÚNICA validação específica: molde maior que bobina
                const moldWidthValidated = this.validateMoldFitsInRoll(mold.width, rollWidth, mold.name);

                console.log('🎯 Chamando calculateMoldOptimization com:', {
                    width: mold.width,
                    height: mold.height,
                    quantity: quantity,
                    rollWidth: rollWidth
                });

                // Calcular otimização
                const optimization = this.calculateMoldOptimization(
                    mold.width, mold.height, quantity, rollWidth
                );

                totalLengthNeeded += optimization.lengthNeeded;
                totalPieces += quantity;
                totalMoldArea += optimization.totalMoldArea;

                calculatedItems.push({
                    moldId: mold.id,
                    moldName: mold.name,
                    moldWidth: mold.width,
                    moldHeight: mold.height,
                    quantity: quantity,
                    moldsAcross: optimization.moldsAcross,
                    totalRows: optimization.totalRows,
                    lengthNeeded: optimization.lengthNeeded,
                    moldArea: optimization.moldAreaM2,
                    totalMoldArea: optimization.totalMoldArea
                });
            }

            // 3. Verificar se há papel suficiente
            if (totalLengthNeeded > rollLength) {
                const difference = (totalLengthNeeded - rollLength).toFixed(2);
                throw new Error(
                    `Papel insuficiente! Necessário: ${totalLengthNeeded.toFixed(2)}m, ` +
                    `Disponível: ${rollLength}m (Falta: ${difference}m)`
                );
            }

            // 4. Calcular custos
            const costs = this.calculateCosts(
                totalLengthNeeded, rollWidth, rollPrice, rollLength,
                additionalCost, profitMargin, totalPieces
            );

            // 5. Montar resultado final
            const result = {
                totalPieces,
                totalLengthNeeded,
                totalRollAreaUsed: costs.totalRollAreaUsed,
                totalMoldArea,
                totalPaperCost: costs.totalPaperCost,
                totalCostWithAdditional: costs.totalCostWithAdditional,
                costPerPiece: costs.costPerPiece,
                sellPricePerPiece: costs.sellPricePerPiece,
                totalSellPrice: costs.totalSellPrice,
                totalProfit: costs.totalProfit,
                items: calculatedItems,
                calculatedAt: new Date().toISOString()
            };

            console.log('✅ Cálculo realizado com sucesso:', result);
            return result;

        } catch (error) {
            console.error('❌ Erro no motor de cálculo:', error);
            throw error;
        }
    }
}

module.exports = CalculationEngine;
