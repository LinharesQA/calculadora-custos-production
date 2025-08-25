/**
 * Serviço de Armazenamento para Dados da Empresa
 * 
 * Gerencia dados isolados por empresa no sistema
 * Integra com o backend para persistência
 */

export class StorageService {
    static async getCompanyData(companyId, module) {
        try {
            const response = await fetch(`/api/companies/${companyId}/modules/${module}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao carregar dados da empresa:', error);
            
            // Fallback para localStorage em caso de erro
            const localData = localStorage.getItem(`company_${companyId}_${module}`);
            return localData ? JSON.parse(localData) : null;
        }
    }

    static async saveCompanyData(companyId, module, data) {
        try {
            const response = await fetch(`/api/companies/${companyId}/modules/${module}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar no servidor');
            }

            // Backup local
            localStorage.setItem(`company_${companyId}_${module}`, JSON.stringify(data));
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados da empresa:', error);
            
            // Salva apenas localmente se houver erro no servidor
            localStorage.setItem(`company_${companyId}_${module}`, JSON.stringify(data));
            throw error;
        }
    }

    static async exportCompanyData(companyId, module) {
        try {
            const data = await this.getCompanyData(companyId, module);
            
            const exportData = {
                companyId,
                module,
                exportedAt: new Date().toISOString(),
                data
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${module}_backup_${companyId}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return false;
        }
    }

    static async importCompanyData(companyId, module, file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (importData.module !== module) {
                throw new Error('Arquivo de backup não é compatível com este módulo');
            }

            await this.saveCompanyData(companyId, module, importData.data);
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw error;
        }
    }
}
