// 🎯 FUNÇÃO DE CÁLCULO - APENAS BACKEND
// Frontend apenas coleta dados e exibe resultados

async function calculateCostsBackendOnly() {
    try {
        console.log('🚀 Iniciando cálculo no BACKEND...');

        // Validações básicas do frontend
        if (planningItems.length === 0) {
            showNotification('Adicione itens ao planejamento primeiro!', 'error');
            return;
        }

        const rollIndex = document.getElementById('calculation-roll-select').value;
        const rollPrice = parseFloat(document.getElementById('roll-price').value);
        const rollLength = parseFloat(document.getElementById('roll-length').value);
        const profitMargin = parseFloat(document.getElementById('profit-margin').value) || 30;
        const additionalCost = parseFloat(document.getElementById('additional-cost').value) || 0;

        // Validar dados básicos
        if (rollIndex === '' || !rollPrice || !rollLength || rollPrice <= 0 || rollLength <= 0) {
            showNotification('Preencha todos os dados da bobina com valores válidos!', 'error');
            return;
        }

        const roll = appState.rolls[rollIndex];
        if (!roll) {
            showNotification('Bobina selecionada não encontrada!', 'error');
            return;
        }

        console.log('📦 Dados coletados para backend:', {
            roll: roll,
            rollPrice,
            rollLength,
            profitMargin,
            additionalCost,
            planningItems: planningItems
        });

        // 🚀 CRIAR PROJETO NO BACKEND
        const projectData = {
            name: `Projeto ${new Date().toLocaleString()}`,
            roll_id: roll.id,
            roll_price: rollPrice,
            roll_length: rollLength,
            profit_margin: profitMargin,
            additional_cost: additionalCost,
            items: planningItems.map(item => ({
                moldId: item.mold.id,
                quantity: item.qty
            }))
        };

        showNotification('Calculando no servidor...', 'info');

        const projectResult = await api.createProject(projectData);
        console.log('✅ Projeto criado no backend:', projectResult);

        // 🧮 EXECUTAR CÁLCULO NO BACKEND (toda a lógica está lá)
        const calcResult = await api.calculateProject(projectResult.project.id, planningItems.map(item => ({
            moldId: item.mold.id,
            quantity: item.qty
        })));

        console.log('✅ Cálculo concluído no backend:', calcResult);

        // 📊 EXIBIR RESULTADOS vindos do backend
        if (calcResult && calcResult.calculations) {
            const backendData = calcResult.calculations;

            // Preparar dados para exibição usando resultados do backend
            const projectDisplayData = {
                roll,
                rollPrice,
                rollLength,
                profitMargin,
                additionalCost,
                items: backendData.items || [],
                results: {
                    totalPieces: backendData.totalPieces || 0,
                    totalLengthNeededM: backendData.totalLengthNeeded || 0,
                    totalRollAreaUsed: backendData.totalRollAreaUsed || 0,
                    totalMoldArea: backendData.totalMoldArea || 0,
                    totalPaperCost: backendData.totalPaperCost || 0,
                    totalCostWithAdditional: backendData.totalCostWithAdditional || 0,
                    costPerPiece: backendData.costPerPiece || 0,
                    sellPricePerPiece: backendData.sellPricePerPiece || 0,
                    totalSellPrice: backendData.totalSellPrice || 0,
                    totalProfit: backendData.totalProfit || 0
                },
                calculatedAt: new Date().toISOString()
            };

            currentProjectData = projectDisplayData;
            displayCalculationResults(projectDisplayData);

            // Atualizar estado local
            appState.lastCalculation = new Date().toISOString();
            saveAppState();
            updateDashboard();

            showNotification('✅ Cálculo realizado com sucesso no servidor!', 'success');
        } else {
            throw new Error('Resultado inválido do servidor');
        }

    } catch (error) {
        console.error('❌ Erro no cálculo:', error);

        // Mensagem de erro mais clara
        let errorMessage = error.message;
        if (error.message.includes('maior que a largura da bobina')) {
            errorMessage += '\n\n💡 Sugestões:\n• Use uma bobina mais larga\n• Escolha um molde menor\n• Rotacione o molde se possível';
        } else if (error.message.includes('Papel insuficiente')) {
            errorMessage += '\n\n💡 Sugestões:\n• Use uma bobina com mais metragem\n• Reduza a quantidade de peças\n• Otimize o layout';
        }

        showNotification(errorMessage, 'error');

        // Limpar resultados em caso de erro
        document.getElementById('planning-result').innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-red-400 text-3xl mb-4"></i>
                <p class="text-red-400 font-medium">Erro no cálculo</p>
                <p class="text-gray-400 text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}
