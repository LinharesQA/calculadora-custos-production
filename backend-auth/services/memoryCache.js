const NodeCache = require('node-cache');

/**
 * 🚀 Sistema de Cache em Memória - Calculadora de Custos
 * 
 * Cache inteligente para otimizar consultas frequentes sem Redis
 * Ideal para 100+ usuários simultâneos
 */
class MemoryCacheService {
    constructor() {
        // Cache principal com TTL de 1 hora
        this.dataCache = new NodeCache({
            stdTTL: 3600,           // 1 hora padrão
            checkperiod: 300,       // Verificar expiração a cada 5 min
            useClones: false,       // Performance: não clonar objetos
            deleteOnExpire: true,   // Limpar automaticamente
            maxKeys: 1000          // Máximo 1000 chaves
        });

        // Cache de resultados de cálculos (TTL maior)
        this.calculationCache = new NodeCache({
            stdTTL: 7200,          // 2 horas para cálculos
            checkperiod: 600,      // Verificar a cada 10 min
            useClones: false,
            maxKeys: 500
        });

        // Cache de sessão/usuários (TTL menor)
        this.sessionCache = new NodeCache({
            stdTTL: 1800,          // 30 minutos
            checkperiod: 120,      // Verificar a cada 2 min
            useClones: false,
            maxKeys: 200
        });

        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };

        this.setupEventListeners();
        console.log('✅ Sistema de Cache em Memória inicializado');
    }

    setupEventListeners() {
        // Logs de eventos do cache (apenas em desenvolvimento)
        if (process.env.NODE_ENV !== 'production') {
            this.dataCache.on('set', (key, value) => {
                console.log(`📦 Cache SET: ${key}`);
            });

            this.dataCache.on('expired', (key, value) => {
                console.log(`⏰ Cache EXPIRED: ${key}`);
            });
        }
    }

    // === MÉTODOS PRINCIPAIS ===

    /**
     * Buscar dado do cache
     */
    get(key, cacheType = 'data') {
        try {
            const cache = this.getCache(cacheType);
            const value = cache.get(key);

            if (value !== undefined) {
                this.stats.hits++;
                return value;
            } else {
                this.stats.misses++;
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar cache:', error.message);
            this.stats.misses++;
            return null;
        }
    }

    /**
     * Armazenar dado no cache
     */
    set(key, value, ttl = null, cacheType = 'data') {
        try {
            const cache = this.getCache(cacheType);
            const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);

            if (success) {
                this.stats.sets++;
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao salvar cache:', error.message);
            return false;
        }
    }

    /**
     * Remover do cache
     */
    del(key, cacheType = 'data') {
        try {
            const cache = this.getCache(cacheType);
            const success = cache.del(key);

            if (success) {
                this.stats.deletes++;
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao deletar cache:', error.message);
            return false;
        }
    }

    /**
     * Limpar cache por padrão
     */
    clearPattern(pattern, cacheType = 'data') {
        try {
            const cache = this.getCache(cacheType);
            const keys = cache.keys();
            let deleted = 0;

            keys.forEach(key => {
                if (key.includes(pattern)) {
                    cache.del(key);
                    deleted++;
                }
            });

            console.log(`🧹 Cache limpo: ${deleted} chaves removidas com padrão "${pattern}"`);
            return deleted;
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error.message);
            return 0;
        }
    }

    // === MÉTODOS ESPECÍFICOS PARA CALCULADORA ===

    /**
     * Cache de formas/moldes
     */
    getMold(moldId) {
        return this.get(`mold:${moldId}`, 'data');
    }

    setMold(moldId, moldData, ttl = 3600) {
        return this.set(`mold:${moldId}`, moldData, ttl, 'data');
    }

    /**
     * Cache de bobinas
     */
    getRoll(rollId) {
        return this.get(`roll:${rollId}`, 'data');
    }

    setRoll(rollId, rollData, ttl = 3600) {
        return this.set(`roll:${rollId}`, rollData, ttl, 'data');
    }

    /**
     * Cache de cálculos (TTL maior)
     */
    getCalculation(calculationHash) {
        return this.get(`calc:${calculationHash}`, 'calculation');
    }

    setCalculation(calculationHash, result, ttl = 7200) {
        return this.set(`calc:${calculationHash}`, result, ttl, 'calculation');
    }

    /**
     * Cache de usuários
     */
    getUser(userId) {
        return this.get(`user:${userId}`, 'session');
    }

    setUser(userId, userData, ttl = 1800) {
        return this.set(`user:${userId}`, userData, ttl, 'session');
    }

    /**
     * Cache de projetos por usuário
     */
    getUserProjects(userId) {
        return this.get(`user:${userId}:projects`, 'data');
    }

    setUserProjects(userId, projects, ttl = 1800) {
        return this.set(`user:${userId}:projects`, projects, ttl, 'data');
    }

    // === MÉTODOS UTILITÁRIOS ===

    getCache(type) {
        switch (type) {
            case 'calculation': return this.calculationCache;
            case 'session': return this.sessionCache;
            default: return this.dataCache;
        }
    }

    /**
     * Estatísticas do cache
     */
    getStats() {
        return {
            performance: this.stats,
            caches: {
                data: {
                    keys: this.dataCache.keys().length,
                    stats: this.dataCache.getStats()
                },
                calculation: {
                    keys: this.calculationCache.keys().length,
                    stats: this.calculationCache.getStats()
                },
                session: {
                    keys: this.sessionCache.keys().length,
                    stats: this.sessionCache.getStats()
                }
            },
            memory: {
                hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0,
                totalOperations: this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes
            }
        };
    }

    /**
     * Health check
     */
    getHealth() {
        const stats = this.getStats();
        const hitRate = stats.memory.hitRate;

        return {
            status: 'healthy',
            type: 'memory',
            hitRate: `${hitRate.toFixed(1)}%`,
            totalKeys: stats.caches.data.keys + stats.caches.calculation.keys + stats.caches.session.keys,
            performance: stats.performance,
            healthy: hitRate > 20 // Consideramos saudável se > 20% hit rate
        };
    }

    /**
     * Limpar todos os caches
     */
    flushAll() {
        try {
            this.dataCache.flushAll();
            this.calculationCache.flushAll();
            this.sessionCache.flushAll();

            // Reset stats
            this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

            console.log('🧹 Todos os caches foram limpos');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar caches:', error.message);
            return false;
        }
    }

    /**
     * Gerar hash para caching de cálculos
     */
    static generateCalculationHash(params) {
        const crypto = require('crypto');
        const data = JSON.stringify(params, Object.keys(params).sort());
        return crypto.createHash('md5').update(data).digest('hex');
    }
}

// Singleton instance
const memoryCache = new MemoryCacheService();

module.exports = memoryCache;
