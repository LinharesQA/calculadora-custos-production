// API Client para comunicação com o backend
class SublimaCalcAPI {
    constructor() {
        // 🌐 USAR CONFIGURAÇÃO DINÂMICA POR AMBIENTE
        this.baseURL = window.APP_CONFIG ? window.APP_CONFIG.getBackendURL() : 'http://localhost:3001/api';
        this.token = localStorage.getItem('authToken');

        console.log('🔗 API configurada para:', this.baseURL);
    }

    // Headers padrão com autenticação
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Método genérico para requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);

            // Se erro 401, redirecionar para login
            if (error.message.includes('401') || error.message.includes('Token')) {
                this.logout();
                window.location.href = '/login.html?error=session_expired';
            }

            throw error;
        }
    }

    // Auth methods
    async verifyToken() {
        if (!this.token) {
            console.log('Nenhum token encontrado');
            return null;
        }

        try {
            console.log('Fazendo requisição para /auth/verify com token:', this.token.substring(0, 20) + '...');
            const response = await this.request('/auth/verify');
            console.log('Resposta completa do verify:', response);
            return response.user;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_data');
        this.token = null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // User methods
    async getDashboard() {
        return await this.request('/user/dashboard');
    }

    async getProfile() {
        return await this.request('/user/profile');
    }

    async updateProfile(data) {
        return await this.request('/user/settings', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async exportData() {
        return await this.request('/user/export');
    }

    // Molds methods
    async getMolds() {
        return await this.request('/molds');
    }

    async createMold(moldData) {
        return await this.request('/molds', {
            method: 'POST',
            body: JSON.stringify(moldData)
        });
    }

    async updateMold(id, moldData) {
        return await this.request(`/molds/${id}`, {
            method: 'PUT',
            body: JSON.stringify(moldData)
        });
    }

    async deleteMold(id) {
        return await this.request(`/molds/${id}`, {
            method: 'DELETE'
        });
    }

    async getMoldsStats() {
        return await this.request('/molds/stats/overview');
    }

    // Rolls methods
    async getRolls() {
        return await this.request('/rolls');
    }

    async createRoll(rollData) {
        return await this.request('/rolls', {
            method: 'POST',
            body: JSON.stringify(rollData)
        });
    }

    async updateRoll(id, rollData) {
        return await this.request(`/rolls/${id}`, {
            method: 'PUT',
            body: JSON.stringify(rollData)
        });
    }

    async deleteRoll(id) {
        return await this.request(`/rolls/${id}`, {
            method: 'DELETE'
        });
    }

    async getRollsStats() {
        return await this.request('/rolls/stats/overview');
    }

    // Projects methods
    async getProjects(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/projects?${query}` : '/projects';
        return await this.request(endpoint);
    }

    async getProject(id) {
        return await this.request(`/projects/${id}`);
    }

    async createProject(projectData) {
        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(id, projectData) {
        return await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    }

    async deleteProject(id) {
        return await this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    async calculateProject(id, items) {
        return await this.request(`/projects/${id}/calculate`, {
            method: 'POST',
            body: JSON.stringify({ items })
        });
    }

    // === MÉTODOS OTIMIZADOS COM PERFORMANCE ===

    /**
     * Versão otimizada com debouncing automático
     */
    createOptimizedCalculateProject() {
        if (!window.frontendPerformance) {
            console.warn('⚠️ Sistema de performance não carregado, usando método padrão');
            return this.calculateProject.bind(this);
        }

        return window.frontendPerformance.createOptimizedCalculator(
            this.calculateProject.bind(this),
            500 // 500ms de debounce
        );
    }

    /**
     * getMolds com cache inteligente
     */
    async getOptimizedMolds() {
        if (window.frontendPerformance) {
            return await window.frontendPerformance.getOptimizedMolds();
        }
        return await this.getMolds();
    }

    /**
     * getRolls com cache inteligente
     */
    async getOptimizedRolls() {
        if (window.frontendPerformance) {
            return await window.frontendPerformance.getOptimizedRolls();
        }
        return await this.getRolls();
    }

    /**
     * getProjects com cache
     */
    async getOptimizedProjects() {
        if (!window.frontendPerformance) {
            return await this.getProjects();
        }

        const cached = window.frontendPerformance.getCache('user_projects');
        if (cached) return cached;

        const projects = await this.getProjects();
        window.frontendPerformance.setCache('user_projects', projects, 'projects');
        return projects;
    }

    /**
     * Invalidar cache quando dados são modificados
     */
    async createProject(data) {
        const result = await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        // Invalidar cache de projetos
        if (window.frontendPerformance) {
            window.frontendPerformance.clearCacheByPattern('user_projects');
        }

        return result;
    }

    async updateProject(id, data) {
        const result = await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        // Invalidar cache de projetos
        if (window.frontendPerformance) {
            window.frontendPerformance.clearCacheByPattern('user_projects');
            window.frontendPerformance.clearCacheByPattern('calc_');
        }

        return result;
    }

    async deleteProject(id) {
        const result = await this.request(`/projects/${id}`, {
            method: 'DELETE'
        });

        // Invalidar cache de projetos
        if (window.frontendPerformance) {
            window.frontendPerformance.clearCacheByPattern('user_projects');
            window.frontendPerformance.clearCacheByPattern('calc_');
        }

        return result;
    }

    async getProjectsStats() {
        return await this.request('/projects/stats/overview');
    }
}

// Instância global da API
const api = new SublimaCalcAPI();

// Utility functions
class UIUtils {
    static showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-transform duration-300 z-50 ${type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
            }`;

        toast.style.transform = 'translateX(0)';

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 4000);
    }

    /**
     * Loading otimizado usando o sistema de performance
     */
    static showOptimizedLoading(elementId, text = 'Carregando...') {
        if (window.frontendPerformance) {
            window.frontendPerformance.showLoading(elementId, text);
        } else {
            this.showLoading(true);
        }
    }

    static hideOptimizedLoading(elementId) {
        if (window.frontendPerformance) {
            window.frontendPerformance.hideLoading(elementId);
        } else {
            this.showLoading(false);
        }
    }

    /**
     * Wrapper para executar promise com loading otimizado
     */
    static async withOptimizedLoading(elementId, promise, text = 'Processando...') {
        if (window.frontendPerformance) {
            return await window.frontendPerformance.withLoading(elementId, promise, text);
        } else {
            this.showLoading(true);
            try {
                return await promise;
            } finally {
                this.showLoading(false);
            }
        }
    }

    /**
     * Debouncer para eventos de input
     */
    static createInputDebouncer(callback, delay = 300) {
        if (window.frontendPerformance) {
            const key = `input_${Date.now()}_${Math.random()}`;
            return window.frontendPerformance.debounce(key, callback, delay);
        } else {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => callback.apply(this, args), delay);
            };
        }
    }

    static showLoading(show = true) {
        const existingLoader = document.querySelector('.loading-overlay');

        if (show && !existingLoader) {
            const loader = document.createElement('div');
            loader.className = 'loading-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loader.innerHTML = `
                <div class="bg-dark-800 rounded-xl p-6 flex items-center space-x-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span class="text-white font-semibold">Carregando...</span>
                </div>
            `;
            document.body.appendChild(loader);
        } else if (!show && existingLoader) {
            existingLoader.remove();
        }
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static async confirmAction(message) {
        return new Promise((resolve) => {
            const confirmed = confirm(message);
            resolve(confirmed);
        });
    }
}

// Authentication helper
class AuthManager {
    static async checkAuth() {
        const user = await api.verifyToken();

        if (!user) {
            window.location.href = 'index-modern.html';
            return false;
        }

        this.updateUserDisplay(user);
        return user;
    }

    static updateUserDisplay(user) {
        // Atualizar nome do usuário
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = user.name || 'Usuário';
        });

        // Atualizar email do usuário
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = user.email || '';
        });

        // Atualizar avatar
        const userAvatarElements = document.querySelectorAll('[data-user-avatar]');
        userAvatarElements.forEach(el => {
            if (user.avatar) {
                el.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
            } else {
                el.innerHTML = `<span class="text-sm font-semibold">${user.name?.charAt(0) || 'U'}</span>`;
            }
        });

        // Salvar dados do usuário
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    static handleAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                api.setToken(token);
                this.updateUserDisplay(user);

                // Limpar URL
                window.history.replaceState({}, document.title, window.location.pathname);

                UIUtils.showToast(`Bem-vindo, ${user.name}!`, 'success');
                return true;
            } catch (error) {
                console.error('Erro ao processar auth callback:', error);
                UIUtils.showToast('Erro na autenticação', 'error');
            }
        }

        const error = urlParams.get('error');
        if (error) {
            UIUtils.showToast('Erro na autenticação. Tente novamente.', 'error');
        }

        return false;
    }
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    UIUtils.showToast('Algo deu errado. Tente novamente.', 'error');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, UIUtils, AuthManager };
}
