/**
 * Serviço Backend para Cálculo de Custos
 * 
 * Gerencia dados isolados por empresa no banco de dados
 */

const { Parse } = require('parse/node');

class CostCalculatorService {
    
    /**
     * Busca todos os dados do módulo para uma empresa
     */
    static async getCompanyData(companyId) {
        try {
            const query = new Parse.Query('CostCalculatorData');
            query.equalTo('companyId', companyId);
            
            const result = await query.first({ useMasterKey: true });
            
            if (result) {
                return {
                    molds: result.get('molds') || [],
                    rolls: result.get('rolls') || [],
                    projects: result.get('projects') || [],
                    settings: result.get('settings') || {},
                    lastCalculation: result.get('lastCalculation'),
                    lastUpdated: result.get('updatedAt')
                };
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao buscar dados da empresa:', error);
            throw error;
        }
    }

    /**
     * Salva dados do módulo para uma empresa
     */
    static async saveCompanyData(companyId, data) {
        try {
            let costCalculatorData;
            
            // Busca registro existente
            const query = new Parse.Query('CostCalculatorData');
            query.equalTo('companyId', companyId);
            
            costCalculatorData = await query.first({ useMasterKey: true });
            
            if (!costCalculatorData) {
                // Cria novo registro
                costCalculatorData = new Parse.Object('CostCalculatorData');
                costCalculatorData.set('companyId', companyId);
            }
            
            // Atualiza dados
            costCalculatorData.set('molds', data.molds || []);
            costCalculatorData.set('rolls', data.rolls || []);
            costCalculatorData.set('projects', data.projects || []);
            costCalculatorData.set('settings', data.settings || {});
            costCalculatorData.set('lastCalculation', data.lastCalculation);
            costCalculatorData.set('updatedBy', data.updatedBy);
            
            // ACL para garantir isolamento por empresa
            const acl = new Parse.ACL();
            acl.setReadAccess(data.updatedBy, true);
            acl.setWriteAccess(data.updatedBy, true);
            acl.setRoleReadAccess(`company_${companyId}`, true);
            acl.setRoleWriteAccess(`company_${companyId}`, true);
            costCalculatorData.setACL(acl);
            
            await costCalculatorData.save(null, { useMasterKey: true });
            
            return costCalculatorData;
        } catch (error) {
            console.error('Erro ao salvar dados da empresa:', error);
            throw error;
        }
    }

    /**
     * Busca projetos com paginação e filtros
     */
    static async getProjects(companyId, options = {}) {
        try {
            const { page = 1, limit = 20, search } = options;
            
            const query = new Parse.Query('CostCalculatorData');
            query.equalTo('companyId', companyId);
            
            const result = await query.first({ useMasterKey: true });
            
            if (!result) {
                return {
                    projects: [],
                    total: 0,
                    page,
                    totalPages: 0
                };
            }
            
            let projects = result.get('projects') || [];
            
            // Filtro de busca
            if (search) {
                projects = projects.filter(project => 
                    project.projectName.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // Ordenação por data (mais recentes primeiro)
            projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            
            // Paginação
            const total = projects.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            const paginatedProjects = projects.slice(startIndex, endIndex);
            
            return {
                projects: paginatedProjects,
                total,
                page,
                totalPages
            };
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
            throw error;
        }
    }

    /**
     * Cria um novo projeto
     */
    static async createProject(companyId, projectData) {
        try {
            const data = await this.getCompanyData(companyId);
            
            if (!data) {
                throw new Error('Dados da empresa não encontrados');
            }
            
            const newProject = {
                ...projectData,
                id: Date.now().toString(),
                savedAt: new Date().toISOString()
            };
            
            data.projects.push(newProject);
            
            await this.saveCompanyData(companyId, {
                ...data,
                updatedBy: projectData.createdBy
            });
            
            return newProject;
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            throw error;
        }
    }

    /**
     * Exclui um projeto
     */
    static async deleteProject(companyId, projectId, userId) {
        try {
            const data = await this.getCompanyData(companyId);
            
            if (!data) {
                throw new Error('Dados da empresa não encontrados');
            }
            
            data.projects = data.projects.filter(project => project.id !== projectId);
            
            await this.saveCompanyData(companyId, {
                ...data,
                updatedBy: userId
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            throw error;
        }
    }

    /**
     * Gera analytics para a empresa
     */
    static async getAnalytics(companyId, period = '30d') {
        try {
            const data = await this.getCompanyData(companyId);
            
            if (!data || !data.projects.length) {
                return this.getEmptyAnalytics();
            }
            
            const projects = data.projects;
            const now = new Date();
            let filterDate;
            
            // Define período de análise
            switch (period) {
                case '7d':
                    filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            // Filtra projetos por período
            const filteredProjects = projects.filter(project => 
                new Date(project.savedAt) >= filterDate
            );
            
            // Cálculos básicos
            const totalProjects = filteredProjects.length;
            const totalValue = filteredProjects.reduce((sum, p) => sum + (p.results?.totalSellPrice || 0), 0);
            const totalCost = filteredProjects.reduce((sum, p) => sum + (p.results?.totalCostWithAdditional || 0), 0);
            const totalProfit = filteredProjects.reduce((sum, p) => sum + (p.results?.totalProfit || 0), 0);
            const totalPieces = filteredProjects.reduce((sum, p) => sum + (p.results?.totalPieces || 0), 0);
            
            const avgTicket = totalProjects > 0 ? totalValue / totalProjects : 0;
            const avgProfitMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
            
            // Analytics por período (últimos 6 meses)
            const monthlyData = this.generateMonthlyData(projects, 6);
            
            // Moldes mais utilizados
            const moldUsage = this.calculateMoldUsage(projects);
            
            // Projetos por faixa de valor
            const valueRanges = this.calculateValueRanges(filteredProjects);
            
            return {
                summary: {
                    totalProjects,
                    totalValue,
                    totalCost,
                    totalProfit,
                    totalPieces,
                    avgTicket,
                    avgProfitMargin
                },
                trends: {
                    monthly: monthlyData,
                    moldUsage,
                    valueRanges
                },
                period,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Erro ao gerar analytics:', error);
            throw error;
        }
    }

    /**
     * Gera dados mensais para gráficos
     */
    static generateMonthlyData(projects, months = 6) {
        const monthlyData = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const monthProjects = projects.filter(project => {
                const projectDate = new Date(project.savedAt);
                return projectDate >= date && projectDate < nextDate;
            });
            
            const monthValue = monthProjects.reduce((sum, p) => sum + (p.results?.totalSellPrice || 0), 0);
            const monthProfit = monthProjects.reduce((sum, p) => sum + (p.results?.totalProfit || 0), 0);
            
            monthlyData.push({
                month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                projects: monthProjects.length,
                value: monthValue,
                profit: monthProfit
            });
        }
        
        return monthlyData;
    }

    /**
     * Calcula uso de moldes
     */
    static calculateMoldUsage(projects) {
        const moldUsage = {};
        
        projects.forEach(project => {
            if (project.items) {
                project.items.forEach(item => {
                    const moldName = item.mold?.name;
                    if (moldName) {
                        moldUsage[moldName] = (moldUsage[moldName] || 0) + (item.qty || 0);
                    }
                });
            }
        });
        
        // Retorna top 10 moldes mais usados
        return Object.entries(moldUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, usage]) => ({ name, usage }));
    }

    /**
     * Calcula distribuição por faixa de valor
     */
    static calculateValueRanges(projects) {
        const ranges = {
            'Até R$ 100': 0,
            'R$ 100 - R$ 500': 0,
            'R$ 500 - R$ 1.000': 0,
            'R$ 1.000 - R$ 5.000': 0,
            'Acima de R$ 5.000': 0
        };
        
        projects.forEach(project => {
            const value = project.results?.totalSellPrice || 0;
            
            if (value <= 100) {
                ranges['Até R$ 100']++;
            } else if (value <= 500) {
                ranges['R$ 100 - R$ 500']++;
            } else if (value <= 1000) {
                ranges['R$ 500 - R$ 1.000']++;
            } else if (value <= 5000) {
                ranges['R$ 1.000 - R$ 5.000']++;
            } else {
                ranges['Acima de R$ 5.000']++;
            }
        });
        
        return Object.entries(ranges).map(([range, count]) => ({ range, count }));
    }

    /**
     * Retorna analytics vazio para empresas sem dados
     */
    static getEmptyAnalytics() {
        return {
            summary: {
                totalProjects: 0,
                totalValue: 0,
                totalCost: 0,
                totalProfit: 0,
                totalPieces: 0,
                avgTicket: 0,
                avgProfitMargin: 0
            },
            trends: {
                monthly: [],
                moldUsage: [],
                valueRanges: []
            },
            period: '30d',
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Exporta dados para backup
     */
    static async exportData(companyId, format = 'json') {
        try {
            const data = await this.getCompanyData(companyId);
            
            const exportData = {
                companyId,
                module: 'cost_calculator',
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                data: data || {}
            };
            
            return exportData;
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            throw error;
        }
    }

    /**
     * Importa dados de backup
     */
    static async importData(companyId, importData, userId) {
        try {
            if (!importData.data) {
                throw new Error('Dados de importação inválidos');
            }
            
            await this.saveCompanyData(companyId, {
                ...importData.data,
                updatedBy: userId,
                importedAt: new Date().toISOString()
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw error;
        }
    }
}

module.exports = CostCalculatorService;
