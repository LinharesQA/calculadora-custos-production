import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { StorageService } from '../../services/StorageService';
import { PDFService } from '../../services/PDFService';
import { ChartService } from '../../services/ChartService';
import './CostCalculator.css';

/**
 * Módulo de Calculadora de Custos para Sublimação
 * 
 * Funcionalidades:
 * - Gerenciamento de moldes e bobinas por empresa
 * - Cálculo de custos de produção
 * - Gestão de projetos com histórico
 * - Exportação de relatórios em PDF
 * - Analytics e dashboards
 * 
 * Integração com o sistema:
 * - Usa AuthContext para dados da empresa logada
 * - Dados isolados por empresa
 * - Interface responsiva e moderna
 */

const CostCalculatorModule = () => {
    const { user, company } = useContext(AuthContext);
    
    // Estados principais
    const [activeTab, setActiveTab] = useState('config');
    const [appState, setAppState] = useState({
        molds: [],
        rolls: [],
        projects: [],
        lastCalculation: null
    });
    const [planningItems, setPlanningItems] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [notification, setNotification] = useState(null);

    // Inicialização do módulo
    useEffect(() => {
        if (company?.id) {
            loadCompanyData();
        }
    }, [company]);

    const loadCompanyData = async () => {
        try {
            const data = await StorageService.getCompanyData(company.id, 'costCalculator');
            if (data) {
                setAppState(data);
            }
        } catch (error) {
            showNotification('Erro ao carregar dados da empresa', 'error');
        }
    };

    const saveCompanyData = async () => {
        try {
            await StorageService.saveCompanyData(company.id, 'costCalculator', appState);
        } catch (error) {
            showNotification('Erro ao salvar dados', 'error');
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Gerenciamento de Moldes
    const addMold = (name, width, height) => {
        if (!name || !width || !height) {
            showNotification('Preencha todos os campos do molde', 'error');
            return false;
        }

        const newMold = {
            id: Date.now().toString(),
            name,
            width: parseFloat(width),
            height: parseFloat(height),
            createdAt: new Date().toISOString(),
            createdBy: user.id
        };

        setAppState(prev => ({
            ...prev,
            molds: [...prev.molds, newMold]
        }));

        showNotification('Molde adicionado com sucesso!', 'success');
        return true;
    };

    const removeMold = (moldId) => {
        setAppState(prev => ({
            ...prev,
            molds: prev.molds.filter(mold => mold.id !== moldId)
        }));
        showNotification('Molde removido!', 'info');
    };

    // Gerenciamento de Bobinas
    const addRoll = (name, width) => {
        if (!name || !width) {
            showNotification('Preencha todos os campos da bobina', 'error');
            return false;
        }

        const newRoll = {
            id: Date.now().toString(),
            name,
            width: parseFloat(width),
            createdAt: new Date().toISOString(),
            createdBy: user.id
        };

        setAppState(prev => ({
            ...prev,
            rolls: [...prev.rolls, newRoll]
        }));

        showNotification('Bobina adicionada com sucesso!', 'success');
        return true;
    };

    const removeRoll = (rollId) => {
        setAppState(prev => ({
            ...prev,
            rolls: prev.rolls.filter(roll => roll.id !== rollId)
        }));
        showNotification('Bobina removida!', 'info');
    };

    // Cálculo de Custos
    const calculateCosts = (formData) => {
        const {
            rollPrice,
            rollLength,
            selectedRollId,
            profitMargin = 30,
            additionalCost = 0,
            projectName = 'Projeto sem nome',
            projectDate
        } = formData;

        // Validações
        if (!selectedRollId || planningItems.length === 0) {
            showNotification('Selecione uma bobina e adicione itens à produção', 'error');
            return null;
        }

        if (!rollPrice || !rollLength || rollPrice <= 0 || rollLength <= 0) {
            showNotification('Preencha os dados de custo da bobina', 'error');
            return null;
        }

        const selectedRoll = appState.rolls.find(roll => roll.id === selectedRollId);
        if (!selectedRoll) {
            showNotification('Bobina selecionada não encontrada', 'error');
            return null;
        }

        // Cálculos
        const rollWidthM = selectedRoll.width / 100;
        const totalSqmInRoll = rollWidthM * rollLength;
        const paperCostPerSqm = rollPrice / totalSqmInRoll;

        let totalLengthNeededM = 0;
        let totalPieces = 0;
        let itemDetails = [];

        for (const item of planningItems) {
            if (item.mold.width > selectedRoll.width) {
                showNotification(`Molde "${item.mold.name}" é mais largo que a bobina`, 'error');
                return null;
            }

            const totalMoldsForItem = item.qty * 2; // Frente e verso
            totalPieces += item.qty;

            const moldsAcross = Math.floor(selectedRoll.width / item.mold.width);
            const totalRows = Math.ceil(totalMoldsForItem / moldsAcross);
            const lengthForItem = (totalRows * item.mold.height) / 100;
            totalLengthNeededM += lengthForItem;

            itemDetails.push({
                ...item,
                moldsAcross,
                totalRows,
                lengthNeeded: lengthForItem,
                areaNeeded: lengthForItem * rollWidthM
            });
        }

        const totalSqmNeeded = totalLengthNeededM * rollWidthM;
        const totalPaperCost = totalSqmNeeded * paperCostPerSqm;
        const totalCostWithAdditional = totalPaperCost + additionalCost;
        const costPerPiece = totalPieces > 0 ? totalCostWithAdditional / totalPieces : 0;
        const sellPricePerPiece = costPerPiece * (1 + profitMargin / 100);
        const totalSellPrice = sellPricePerPiece * totalPieces;
        const totalProfit = totalSellPrice - totalCostWithAdditional;

        const calculationResult = {
            projectName,
            projectDate,
            companyId: company.id,
            companyName: company.name,
            userId: user.id,
            userName: user.name,
            roll: selectedRoll,
            rollPrice,
            rollLength,
            profitMargin,
            additionalCost,
            items: itemDetails,
            results: {
                paperCostPerSqm,
                totalLengthNeededM,
                totalSqmNeeded,
                totalPaperCost,
                totalCostWithAdditional,
                costPerPiece,
                sellPricePerPiece,
                totalSellPrice,
                totalProfit,
                totalPieces
            },
            calculatedAt: new Date().toISOString()
        };

        setCurrentProject(calculationResult);
        setAppState(prev => ({
            ...prev,
            lastCalculation: new Date().toISOString()
        }));

        showNotification('Cálculo realizado com sucesso!', 'success');
        return calculationResult;
    };

    // Gerenciamento de Projetos
    const saveProject = () => {
        if (!currentProject) {
            showNotification('Nenhum projeto calculado para salvar', 'error');
            return;
        }

        const projectToSave = {
            ...currentProject,
            id: Date.now().toString(),
            savedAt: new Date().toISOString()
        };

        setAppState(prev => ({
            ...prev,
            projects: [...prev.projects, projectToSave]
        }));

        showNotification('Projeto salvo com sucesso!', 'success');
    };

    const deleteProject = (projectId) => {
        setAppState(prev => ({
            ...prev,
            projects: prev.projects.filter(project => project.id !== projectId)
        }));
        showNotification('Projeto excluído!', 'info');
    };

    // Exportação de PDF
    const exportToPDF = async (project = currentProject) => {
        if (!project) {
            showNotification('Nenhum projeto para exportar', 'error');
            return;
        }

        try {
            await PDFService.generateReport(project);
            showNotification('PDF exportado com sucesso!', 'success');
        } catch (error) {
            showNotification('Erro ao gerar PDF', 'error');
        }
    };

    // Analytics
    const getAnalytics = () => {
        const totalProjects = appState.projects.length;
        const totalValue = appState.projects.reduce((sum, p) => sum + p.results.totalSellPrice, 0);
        const totalPieces = appState.projects.reduce((sum, p) => sum + p.results.totalPieces, 0);
        const avgTicket = totalProjects > 0 ? totalValue / totalProjects : 0;

        return {
            totalProjects,
            totalValue,
            totalPieces,
            avgTicket,
            lastCalculation: appState.lastCalculation
        };
    };

    // Auto-save quando dados mudam
    useEffect(() => {
        if (company?.id && appState.molds.length >= 0) {
            saveCompanyData();
        }
    }, [appState]);

    return (
        <div className="cost-calculator-module">
            {/* Header do Módulo */}
            <ModuleHeader 
                companyName={company?.name}
                analytics={getAnalytics()}
            />

            {/* Notificações */}
            {notification && (
                <Notification 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Navegação por Tabs */}
            <TabNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Conteúdo das Tabs */}
            <div className="tab-content">
                {activeTab === 'config' && (
                    <ConfigurationTab
                        molds={appState.molds}
                        rolls={appState.rolls}
                        onAddMold={addMold}
                        onRemoveMold={removeMold}
                        onAddRoll={addRoll}
                        onRemoveRoll={removeRoll}
                    />
                )}

                {activeTab === 'planning' && (
                    <PlanningTab
                        molds={appState.molds}
                        rolls={appState.rolls}
                        planningItems={planningItems}
                        setPlanningItems={setPlanningItems}
                        onCalculate={calculateCosts}
                        currentProject={currentProject}
                        onSaveProject={saveProject}
                        onExportPDF={exportToPDF}
                    />
                )}

                {activeTab === 'projects' && (
                    <ProjectsTab
                        projects={appState.projects}
                        onDeleteProject={deleteProject}
                        onExportProject={exportToPDF}
                        onViewProject={setCurrentProject}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab
                        projects={appState.projects}
                        analytics={getAnalytics()}
                    />
                )}
            </div>
        </div>
    );
};

// Componentes auxiliares serão implementados em arquivos separados
const ModuleHeader = ({ companyName, analytics }) => (
    <div className="module-header gradient-bg text-white py-6">
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">Calculadora de Custos - Sublimação</h1>
            <p className="text-blue-100">Empresa: {companyName}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm opacity-90">Moldes</div>
                    <div className="text-lg font-bold">{analytics.totalMolds || 0}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm opacity-90">Projetos</div>
                    <div className="text-lg font-bold">{analytics.totalProjects}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm opacity-90">Valor Total</div>
                    <div className="text-lg font-bold">
                        {analytics.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm opacity-90">Ticket Médio</div>
                    <div className="text-lg font-bold">
                        {analytics.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Notification = ({ message, type, onClose }) => (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white font-medium max-w-sm ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
    }`}>
        <div className="flex justify-between items-center">
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
                ×
            </button>
        </div>
    </div>
);

const TabNavigation = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'config', label: 'Configurações', icon: '⚙️' },
        { id: 'planning', label: 'Planejamento', icon: '📋' },
        { id: 'projects', label: 'Projetos', icon: '📁' },
        { id: 'analytics', label: 'Analytics', icon: '📊' }
    ];

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <nav className="flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default CostCalculatorModule;
