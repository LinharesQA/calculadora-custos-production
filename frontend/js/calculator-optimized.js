/**
 * 🚀 Exemplo de Implementação da Calculadora Otimizada
 * 
 * Como usar o sistema de performance na prática
 */

class OptimizedCalculatorExample {
    constructor() {
        this.optimizedCalculate = null;
        this.currentProjectId = null;
        this.items = [];
        this.init();
    }

    init() {
        // Aguardar carregamento dos sistemas
        this.waitForSystems().then(() => {
            this.setupOptimizedCalculator();
            this.setupFormHandlers();
            this.preloadData();
        });
    }

    async waitForSystems() {
        // Aguardar sistemas de performance e API
        return new Promise((resolve) => {
            const checkSystems = () => {
                if (window.api && window.frontendPerformance) {
                    resolve();
                } else {
                    setTimeout(checkSystems, 100);
                }
            };
            checkSystems();
        });
    }

    setupOptimizedCalculator() {
        // Criar função de cálculo otimizada com debouncing
        this.optimizedCalculate = window.api.createOptimizedCalculateProject();
        console.log('✅ Calculadora otimizada configurada');
    }

    setupFormHandlers() {
        // Configurar debouncing para inputs da calculadora
        this.setupQuantityInputs();
        this.setupDimensionInputs();
        this.setupMaterialSelects();
    }

    setupQuantityInputs() {
        const quantityInputs = document.querySelectorAll('input[data-field="quantity"]');

        quantityInputs.forEach(input => {
            const debouncedHandler = UIUtils.createInputDebouncer((event) => {
                this.updateItemQuantity(input.dataset.itemId, event.target.value);
                this.triggerOptimizedCalculation();
            }, 300);

            input.addEventListener('input', debouncedHandler);
        });
    }

    setupDimensionInputs() {
        const dimensionInputs = document.querySelectorAll('input[data-field="width"], input[data-field="height"]');

        dimensionInputs.forEach(input => {
            const debouncedHandler = UIUtils.createInputDebouncer((event) => {
                this.updateItemDimension(input.dataset.itemId, input.dataset.field, event.target.value);
                this.triggerOptimizedCalculation();
            }, 500); // Dimensões podem ter delay maior

            input.addEventListener('input', debouncedHandler);
        });
    }

    setupMaterialSelects() {
        const materialSelects = document.querySelectorAll('select[data-field="material"]');

        materialSelects.forEach(select => {
            // Selects não precisam de debouncing
            select.addEventListener('change', (event) => {
                this.updateItemMaterial(select.dataset.itemId, event.target.value);
                this.triggerOptimizedCalculation();
            });
        });
    }

    async preloadData() {
        try {
            console.log('🔄 Preload de dados da calculadora...');

            // Preload em paralelo usando métodos otimizados
            const [molds, rolls] = await Promise.all([
                window.api.getOptimizedMolds(),
                window.api.getOptimizedRolls()
            ]);

            this.populateMaterialSelects(molds, rolls);
            console.log('✅ Dados da calculadora carregados');
        } catch (error) {
            console.error('❌ Erro no preload:', error);
            UIUtils.showToast('Erro ao carregar dados iniciais', 'error');
        }
    }

    populateMaterialSelects(molds, rolls) {
        const moldSelects = document.querySelectorAll('select[data-type="mold"]');
        const rollSelects = document.querySelectorAll('select[data-type="roll"]');

        // Popular selects de moldes
        moldSelects.forEach(select => {
            select.innerHTML = '<option value="">Selecionar molde...</option>';
            molds.forEach(mold => {
                select.innerHTML += `<option value="${mold.id}">${mold.name} - ${mold.thickness}mm</option>`;
            });
        });

        // Popular selects de bobinas
        rollSelects.forEach(select => {
            select.innerHTML = '<option value="">Selecionar bobina...</option>';
            rolls.forEach(roll => {
                select.innerHTML += `<option value="${roll.id}">${roll.name} - ${roll.width}mm</option>`;
            });
        });
    }

    updateItemQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = parseFloat(quantity) || 0;
        }
    }

    updateItemDimension(itemId, field, value) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item[field] = parseFloat(value) || 0;
        }
    }

    updateItemMaterial(itemId, materialId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.materialId = materialId;
        }
    }

    async triggerOptimizedCalculation() {
        if (!this.currentProjectId || !this.optimizedCalculate) return;

        try {
            // Mostrar loading no botão de calcular (se existir)
            const calculateBtn = document.getElementById('calculate-btn');
            if (calculateBtn) {
                UIUtils.showOptimizedLoading('calculate-btn', 'Calculando...');
            }

            // Executar cálculo otimizado (com debouncing automático)
            const result = await this.optimizedCalculate(this.currentProjectId, this.items);

            // Atualizar interface com resultado
            this.updateCalculationResults(result);

        } catch (error) {
            console.error('Erro no cálculo:', error);
            UIUtils.showToast('Erro no cálculo', 'error');
        } finally {
            // Esconder loading
            const calculateBtn = document.getElementById('calculate-btn');
            if (calculateBtn) {
                UIUtils.hideOptimizedLoading('calculate-btn');
            }
        }
    }

    updateCalculationResults(result) {
        // Atualizar totais
        const totalCostElement = document.getElementById('total-cost');
        if (totalCostElement && result.totalCost) {
            totalCostElement.textContent = UIUtils.formatCurrency(result.totalCost);
        }

        // Atualizar breakdown de custos
        const breakdownElement = document.getElementById('cost-breakdown');
        if (breakdownElement && result.breakdown) {
            this.updateCostBreakdown(breakdownElement, result.breakdown);
        }

        // Atualizar custos por item
        if (result.items) {
            result.items.forEach(item => {
                this.updateItemCost(item.id, item.cost);
            });
        }
    }

    updateCostBreakdown(container, breakdown) {
        container.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span>Material:</span>
                    <span>${UIUtils.formatCurrency(breakdown.material || 0)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Mão de obra:</span>
                    <span>${UIUtils.formatCurrency(breakdown.labor || 0)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Margem:</span>
                    <span>${UIUtils.formatCurrency(breakdown.margin || 0)}</span>
                </div>
                <hr class="my-2">
                <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${UIUtils.formatCurrency(breakdown.total || 0)}</span>
                </div>
            </div>
        `;
    }

    updateItemCost(itemId, cost) {
        const costElement = document.querySelector(`[data-item-cost="${itemId}"]`);
        if (costElement) {
            costElement.textContent = UIUtils.formatCurrency(cost);
        }
    }

    /**
     * Adicionar novo item com otimização
     */
    async addCalculationItem() {
        const newItem = {
            id: `item_${Date.now()}`,
            quantity: 1,
            width: 0,
            height: 0,
            materialId: null
        };

        this.items.push(newItem);

        // Renderizar item na interface
        await this.renderCalculationItem(newItem);

        // Reconfigurar handlers para o novo item
        this.setupFormHandlers();
    }

    async renderCalculationItem(item) {
        // Buscar dados de materiais do cache
        const [molds, rolls] = await Promise.all([
            window.api.getOptimizedMolds(),
            window.api.getOptimizedRolls()
        ]);

        const itemHTML = `
            <div class="calculation-item border rounded-lg p-4" data-item-id="${item.id}">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Quantidade</label>
                        <input type="number" 
                               data-field="quantity" 
                               data-item-id="${item.id}"
                               value="${item.quantity}" 
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Largura (mm)</label>
                        <input type="number" 
                               data-field="width" 
                               data-item-id="${item.id}"
                               value="${item.width}" 
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Altura (mm)</label>
                        <input type="number" 
                               data-field="height" 
                               data-item-id="${item.id}"
                               value="${item.height}" 
                               class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Material</label>
                        <select data-field="material" 
                                data-item-id="${item.id}"
                                class="w-full px-3 py-2 border rounded-lg">
                            <option value="">Selecionar...</option>
                            <optgroup label="Moldes">
                                ${molds.map(mold =>
            `<option value="mold_${mold.id}">${mold.name} - ${mold.thickness}mm</option>`
        ).join('')}
                            </optgroup>
                            <optgroup label="Bobinas">
                                ${rolls.map(roll =>
            `<option value="roll_${roll.id}">${roll.name} - ${roll.width}mm</option>`
        ).join('')}
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div class="mt-4 text-right">
                    <span class="text-lg font-bold" data-item-cost="${item.id}">R$ 0,00</span>
                </div>
            </div>
        `;

        const container = document.getElementById('calculation-items');
        if (container) {
            container.insertAdjacentHTML('beforeend', itemHTML);
        }
    }

    /**
     * Performance stats para debug
     */
    getPerformanceStats() {
        if (window.frontendPerformance) {
            return window.frontendPerformance.getStats();
        }
        return { message: 'Sistema de performance não disponível' };
    }
}

// Inicializar calculadora otimizada quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.optimizedCalculator = new OptimizedCalculatorExample();
});

// Função para debug no console
window.debugPerformance = () => {
    if (window.optimizedCalculator) {
        console.table(window.optimizedCalculator.getPerformanceStats());
    }
};
