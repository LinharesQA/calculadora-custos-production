/**
 * 🚀 Sistema de Performance Frontend - Calculadora de Custos
 * 
 * Otimizações para alta performance com 100+ usuários simultâneos:
 * - Debouncing de requisições 
 * - Cache local inteligente
 * - Loading states visuais
 * - Preload de dados críticos
 */

class FrontendPerformance {
    constructor() {
        this.cache = new Map();
        this.debouncers = new Map();
        this.loadingStates = new Map();

        // Configurações de cache (TTL em milissegundos)
        this.cacheTTL = {
            molds: 30 * 60 * 1000,      // 30 minutos
            rolls: 30 * 60 * 1000,      // 30 minutos  
            calculations: 10 * 60 * 1000, // 10 minutos
            projects: 5 * 60 * 1000,    // 5 minutos
            user: 60 * 60 * 1000        // 1 hora
        };

        this.init();
    }

    init() {
        console.log('🚀 Sistema de Performance Frontend inicializado');
        this.setupGlobalOptimizations();
        this.preloadCriticalData();
    }

    // === DEBOUNCING SYSTEM ===

    /**
     * Cria uma função debounced para evitar muitas requisições
     */
    debounce(key, func, delay = 500) {
        return (...args) => {
            // Limpar timeout anterior
            if (this.debouncers.has(key)) {
                clearTimeout(this.debouncers.get(key));
            }

            // Criar novo timeout
            const timeoutId = setTimeout(() => {
                func.apply(this, args);
                this.debouncers.delete(key);
            }, delay);

            this.debouncers.set(key, timeoutId);
        };
    }

    /**
     * Cancela um debounce específico
     */
    cancelDebounce(key) {
        if (this.debouncers.has(key)) {
            clearTimeout(this.debouncers.get(key));
            this.debouncers.delete(key);
        }
    }

    // === CACHE SYSTEM ===

    /**
     * Salva dados no cache com TTL
     */
    setCache(key, data, type = 'default') {
        const ttl = this.cacheTTL[type] || this.cacheTTL.default || 5 * 60 * 1000;
        const cacheItem = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl,
            type: type
        };

        this.cache.set(key, cacheItem);
        console.log(`📦 Cache SET: ${key} (TTL: ${ttl / 1000}s)`);
    }

    /**
     * Recupera dados do cache
     */
    getCache(key) {
        const cacheItem = this.cache.get(key);

        if (!cacheItem) {
            return null;
        }

        // Verificar se expirou
        if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
            this.cache.delete(key);
            console.log(`⏰ Cache EXPIRED: ${key}`);
            return null;
        }

        console.log(`✅ Cache HIT: ${key}`);
        return cacheItem.data;
    }

    /**
     * Remove item do cache
     */
    clearCache(key) {
        this.cache.delete(key);
        console.log(`🗑️ Cache CLEARED: ${key}`);
    }

    /**
     * Limpa cache por padrão
     */
    clearCacheByPattern(pattern) {
        let cleared = 0;
        for (const [key, value] of this.cache.entries()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                cleared++;
            }
        }
        console.log(`🧹 Cache pattern cleared: "${pattern}" (${cleared} items)`);
    }

    // === LOADING STATES ===

    /**
     * Mostra loading state
     */
    showLoading(elementId, text = 'Carregando...') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Salvar estado original
        if (!this.loadingStates.has(elementId)) {
            this.loadingStates.set(elementId, {
                originalHTML: element.innerHTML,
                originalDisabled: element.disabled
            });
        }

        // Aplicar loading state
        element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
        element.disabled = true;
        element.classList.add('loading');
    }

    /**
     * Remove loading state
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element || !this.loadingStates.has(elementId)) return;

        const originalState = this.loadingStates.get(elementId);

        // Restaurar estado original
        element.innerHTML = originalState.originalHTML;
        element.disabled = originalState.originalDisabled;
        element.classList.remove('loading');

        this.loadingStates.delete(elementId);
    }

    /**
     * Loading automático para promises
     */
    async withLoading(elementId, promise, text = 'Processando...') {
        this.showLoading(elementId, text);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hideLoading(elementId);
        }
    }

    // === PRELOAD SYSTEM ===

    /**
     * Preload de dados críticos
     */
    async preloadCriticalData() {
        if (!window.api || !window.api.token) {
            return; // Usuário não logado
        }

        try {
            // Preload em paralelo dos dados mais usados
            const preloadPromises = [
                this.preloadMolds(),
                this.preloadRolls(),
                this.preloadUserProjects()
            ];

            await Promise.allSettled(preloadPromises);
            console.log('✅ Preload de dados críticos concluído');
        } catch (error) {
            console.warn('⚠️ Erro no preload:', error.message);
        }
    }

    async preloadMolds() {
        const cached = this.getCache('molds_list');
        if (cached) return cached;

        try {
            const molds = await window.api.getMolds();
            this.setCache('molds_list', molds, 'molds');
            return molds;
        } catch (error) {
            console.warn('Erro ao preload moldes:', error.message);
        }
    }

    async preloadRolls() {
        const cached = this.getCache('rolls_list');
        if (cached) return cached;

        try {
            const rolls = await window.api.getRolls();
            this.setCache('rolls_list', rolls, 'rolls');
            return rolls;
        } catch (error) {
            console.warn('Erro ao preload bobinas:', error.message);
        }
    }

    async preloadUserProjects() {
        const cached = this.getCache('user_projects');
        if (cached) return cached;

        try {
            const projects = await window.api.getProjects();
            this.setCache('user_projects', projects, 'projects');
            return projects;
        } catch (error) {
            console.warn('Erro ao preload projetos:', error.message);
        }
    }

    // === API OPTIMIZATION WRAPPER ===

    /**
     * Wrapper otimizado para getMolds
     */
    async getOptimizedMolds() {
        const cached = this.getCache('molds_list');
        if (cached) return cached;

        const molds = await window.api.getMolds();
        this.setCache('molds_list', molds, 'molds');
        return molds;
    }

    /**
     * Wrapper otimizado para getRolls
     */
    async getOptimizedRolls() {
        const cached = this.getCache('rolls_list');
        if (cached) return cached;

        const rolls = await window.api.getRolls();
        this.setCache('rolls_list', rolls, 'rolls');
        return rolls;
    }

    /**
     * Wrapper otimizado para cálculos com debouncing
     */
    createOptimizedCalculator(calculateFunction, delay = 500) {
        return this.debounce('calculation', async (projectId, items) => {
            // Gerar hash dos parâmetros para cache
            const paramsHash = this.generateHash({ projectId, items });
            const cacheKey = `calc_${paramsHash}`;

            // Verificar cache primeiro
            const cached = this.getCache(cacheKey);
            if (cached) {
                console.log('✅ Cálculo retornado do cache');
                return cached;
            }

            // Executar cálculo
            const result = await calculateFunction(projectId, items);

            // Salvar no cache
            this.setCache(cacheKey, result, 'calculations');

            return result;
        }, delay);
    }

    // === UTILITY METHODS ===

    /**
     * Gera hash simples para cache de parâmetros
     */
    generateHash(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Configurações globais de otimização
     */
    setupGlobalOptimizations() {
        // Otimizar scroll events
        this.setupScrollOptimization();

        // Otimizar resize events
        this.setupResizeOptimization();

        // Interceptar erros de rede
        this.setupNetworkErrorHandling();
    }

    setupScrollOptimization() {
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                // Lazy load de imagens se necessário
                this.lazyLoadVisibleImages();
            }, 100);
        }, { passive: true });
    }

    setupResizeOptimization() {
        const resizeHandler = this.debounce('window_resize', () => {
            // Recalcular layouts se necessário
            window.dispatchEvent(new Event('optimized_resize'));
        }, 250);

        window.addEventListener('resize', resizeHandler);
    }

    setupNetworkErrorHandling() {
        window.addEventListener('online', () => {
            console.log('🌐 Conexão restaurada - recarregando dados críticos');
            this.preloadCriticalData();
        });

        window.addEventListener('offline', () => {
            console.log('📡 Conexão perdida - usando dados em cache');
        });
    }

    lazyLoadVisibleImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Estatísticas de performance
     */
    getStats() {
        return {
            cache: {
                size: this.cache.size,
                keys: Array.from(this.cache.keys()),
                hitRate: this.calculateHitRate()
            },
            debouncers: {
                active: this.debouncers.size
            },
            loadingStates: {
                active: this.loadingStates.size
            }
        };
    }

    calculateHitRate() {
        // Implementação básica - pode ser melhorada
        return 'N/A (implementar contador de hits/misses)';
    }

    /**
     * Cleanup para evitar memory leaks
     */
    cleanup() {
        // Limpar todos os timeouts
        for (const [key, timeoutId] of this.debouncers.entries()) {
            clearTimeout(timeoutId);
        }

        this.debouncers.clear();
        this.loadingStates.clear();
        this.cache.clear();

        console.log('🧹 Performance system cleaned up');
    }
}

// Inicializar sistema de performance
window.frontendPerformance = new FrontendPerformance();

// Cleanup automático quando sair da página
window.addEventListener('beforeunload', () => {
    window.frontendPerformance.cleanup();
});
