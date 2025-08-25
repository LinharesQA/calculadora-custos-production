/**
 * Configuração de rotas para o módulo de Cálculo de Custos
 * 
 * Integra com o sistema de roteamento existente
 */

import { lazy } from 'react';

// Lazy loading do módulo para otimização
const CostCalculatorModule = lazy(() => import('../components/CostCalculator/CostCalculatorModule'));

export const costCalculatorRoutes = [
    {
        path: '/cost-calculator',
        element: CostCalculatorModule,
        name: 'Calculadora de Custos',
        icon: '💰',
        description: 'Cálculo de custos para sublimação',
        permissions: ['cost_calculator_view'],
        module: 'cost_calculator'
    },
    {
        path: '/cost-calculator/projects',
        element: CostCalculatorModule,
        name: 'Projetos de Custo',
        icon: '📋',
        description: 'Gerenciar projetos de cálculo',
        permissions: ['cost_calculator_view', 'cost_calculator_projects'],
        module: 'cost_calculator',
        defaultTab: 'projects'
    },
    {
        path: '/cost-calculator/analytics',
        element: CostCalculatorModule,
        name: 'Analytics de Custos',
        icon: '📊',
        description: 'Análises e relatórios de custos',
        permissions: ['cost_calculator_view', 'cost_calculator_analytics'],
        module: 'cost_calculator',
        defaultTab: 'analytics'
    }
];

// Configuração do módulo para o sistema
export const costCalculatorModuleConfig = {
    id: 'cost_calculator',
    name: 'Calculadora de Custos',
    description: 'Módulo para cálculo de custos de produção de sublimação',
    version: '1.0.0',
    category: 'Produção',
    
    // Permissões necessárias
    permissions: [
        {
            name: 'cost_calculator_view',
            description: 'Visualizar calculadora de custos'
        },
        {
            name: 'cost_calculator_edit',
            description: 'Editar configurações de custos'
        },
        {
            name: 'cost_calculator_projects',
            description: 'Gerenciar projetos de custos'
        },
        {
            name: 'cost_calculator_analytics',
            description: 'Visualizar analytics de custos'
        },
        {
            name: 'cost_calculator_export',
            description: 'Exportar relatórios de custos'
        }
    ],
    
    // Configurações padrão do módulo
    defaultSettings: {
        currency: 'BRL',
        defaultProfitMargin: 30,
        autoSaveEnabled: true,
        pdfWatermark: true,
        chartAnimations: true
    },
    
    // Dados que o módulo armazena
    dataStructure: {
        molds: 'array',
        rolls: 'array', 
        projects: 'array',
        settings: 'object',
        analytics: 'object'
    },
    
    // APIs que o módulo consome
    apiEndpoints: [
        'GET /api/companies/{companyId}/modules/cost_calculator',
        'POST /api/companies/{companyId}/modules/cost_calculator',
        'GET /api/companies/{companyId}/modules/cost_calculator/projects',
        'POST /api/companies/{companyId}/modules/cost_calculator/projects',
        'DELETE /api/companies/{companyId}/modules/cost_calculator/projects/{projectId}',
        'GET /api/companies/{companyId}/modules/cost_calculator/analytics'
    ],
    
    // Dependências do módulo
    dependencies: [
        'jspdf',
        'chart.js',
        'date-fns'
    ],
    
    // Configurações de menu
    menuItems: [
        {
            label: 'Configurações',
            icon: '⚙️',
            route: '/cost-calculator',
            tab: 'config'
        },
        {
            label: 'Planejamento',
            icon: '📋',
            route: '/cost-calculator',
            tab: 'planning'
        },
        {
            label: 'Projetos',
            icon: '📁',
            route: '/cost-calculator/projects'
        },
        {
            label: 'Relatórios',
            icon: '📊',
            route: '/cost-calculator/analytics'
        }
    ]
};
