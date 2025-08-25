/**
 * API Backend para o Módulo de Cálculo de Custos
 * 
 * Endpoints para gerenciar dados isolados por empresa
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, checkCompanyAccess } = require('../middleware/auth');
const CostCalculatorService = require('../services/CostCalculatorService');

// Middleware para validar acesso à empresa
router.use('/:companyId/*', authenticateToken, checkCompanyAccess);

/**
 * GET /api/companies/:companyId/modules/cost_calculator
 * Busca todos os dados do módulo para a empresa
 */
router.get('/:companyId/modules/cost_calculator', async (req, res) => {
    try {
        const { companyId } = req.params;
        const data = await CostCalculatorService.getCompanyData(companyId);
        
        res.json({
            success: true,
            data: data || {
                molds: [],
                rolls: [],
                projects: [],
                settings: {},
                lastCalculation: null
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dados do módulo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/companies/:companyId/modules/cost_calculator
 * Salva/atualiza dados do módulo para a empresa
 */
router.post('/:companyId/modules/cost_calculator', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { user } = req;
        const moduleData = req.body;
        
        // Adiciona metadados de auditoria
        const dataToSave = {
            ...moduleData,
            lastUpdated: new Date().toISOString(),
            updatedBy: user.id,
            companyId
        };
        
        await CostCalculatorService.saveCompanyData(companyId, dataToSave);
        
        res.json({
            success: true,
            message: 'Dados salvos com sucesso'
        });
    } catch (error) {
        console.error('Erro ao salvar dados do módulo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao salvar dados'
        });
    }
});

/**
 * GET /api/companies/:companyId/modules/cost_calculator/projects
 * Busca apenas os projetos da empresa
 */
router.get('/:companyId/modules/cost_calculator/projects', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { page = 1, limit = 20, search } = req.query;
        
        const projects = await CostCalculatorService.getProjects(companyId, {
            page: parseInt(page),
            limit: parseInt(limit),
            search
        });
        
        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar projetos'
        });
    }
});

/**
 * POST /api/companies/:companyId/modules/cost_calculator/projects
 * Cria um novo projeto
 */
router.post('/:companyId/modules/cost_calculator/projects', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { user } = req;
        const projectData = req.body;
        
        const project = await CostCalculatorService.createProject(companyId, {
            ...projectData,
            createdBy: user.id,
            createdAt: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar projeto'
        });
    }
});

/**
 * DELETE /api/companies/:companyId/modules/cost_calculator/projects/:projectId
 * Exclui um projeto específico
 */
router.delete('/:companyId/modules/cost_calculator/projects/:projectId', async (req, res) => {
    try {
        const { companyId, projectId } = req.params;
        const { user } = req;
        
        await CostCalculatorService.deleteProject(companyId, projectId, user.id);
        
        res.json({
            success: true,
            message: 'Projeto excluído com sucesso'
        });
    } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir projeto'
        });
    }
});

/**
 * GET /api/companies/:companyId/modules/cost_calculator/analytics
 * Busca analytics do módulo para a empresa
 */
router.get('/:companyId/modules/cost_calculator/analytics', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { period = '30d' } = req.query;
        
        const analytics = await CostCalculatorService.getAnalytics(companyId, period);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Erro ao buscar analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar analytics'
        });
    }
});

/**
 * POST /api/companies/:companyId/modules/cost_calculator/export
 * Exporta dados para backup
 */
router.post('/:companyId/modules/cost_calculator/export', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { format = 'json' } = req.body;
        
        const exportData = await CostCalculatorService.exportData(companyId, format);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=cost_calculator_backup_${companyId}.json`);
        res.json(exportData);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao exportar dados'
        });
    }
});

/**
 * POST /api/companies/:companyId/modules/cost_calculator/import
 * Importa dados de backup
 */
router.post('/:companyId/modules/cost_calculator/import', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { user } = req;
        const importData = req.body;
        
        await CostCalculatorService.importData(companyId, importData, user.id);
        
        res.json({
            success: true,
            message: 'Dados importados com sucesso'
        });
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao importar dados'
        });
    }
});

module.exports = router;
