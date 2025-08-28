const redis = require('redis');

/**
 * 🚀 Sistema de Cache Redis Inteligente - Calculadora de Custos
 * 
 * Cache distribuído para alta performance com 100+ usuários simultâneos
 * Fallback automático para memória se Redis não disponível
 */
class RedisCacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.fallbackCache = new Map(); // Cache em memória como fallback

        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            errors: 0
        };

        // TTLs padrão para diferentes tipos de dados
        this.defaultTTL = {
            molds: 3600,        // 1 hora - dados de formas
            rolls: 3600,        // 1 hora - dados de bobinas  
            calculations: 7200, // 2 horas - resultados de cálculos
            users: 1800,        // 30 min - dados de usuários
            projects: 1800,     // 30 min - projetos
            session: 86400      // 24 horas - dados de sessão
        };

        this.init();
    }

    async init() {
        try {
            await this.createConnection();
            console.log('✅ Sistema de Cache Redis inicializado');
        } catch (error) {
            console.log('⚠️ Cache funcionando em modo fallback (memória)');
        }
    }

    // === CONEXÃO REDIS ===
    async createConnection() {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            console.log('🔄 Cache: Redis não configurado, usando fallback em memória');
            return null;
        }

        console.log('🔄 Conectando ao Redis Cache...');

        try {
            this.client = redis.createClient({
                url: redisUrl,
                socket: {
                    connectTimeout: 5000,
                    reconnectStrategy: (retries) => {
                        if (retries >= 3) {
                            console.error('❌ Cache Redis: Máximo de tentativas atingido');
                            return false;
                        }
                        const delay = Math.min(retries * 1000, 3000);
                        console.log(`🔄 Cache Redis: Tentativa ${retries + 1}/3 em ${delay}ms`);
                        return delay;
                    }
                }
            });

            // Event listeners
            this.client.on('connect', () => {
                console.log('✅ Cache Redis conectado');
                this.isConnected = true;
            });

            this.client.on('error', (err) => {
                console.error('❌ Cache Redis erro:', err.message);
                this.isConnected = false;
                this.stats.errors++;
            });

            this.client.on('end', () => {
                console.log('🔌 Cache Redis desconectado');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;

        } catch (error) {
            console.error('❌ Erro ao conectar Redis Cache:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    // === MÉTODOS PRINCIPAIS ===

    /**
     * Buscar dados do cache
     */
    async get(key) {
        try {
            let value = null;

            // Tentar Redis primeiro
            if (this.isConnected && this.client) {
                try {
                    value = await this.client.get(key);
                    if (value) {
                        this.stats.hits++;
                        return JSON.parse(value);
                    }
                } catch (redisError) {
                    console.warn(`⚠️ Redis get error para ${key}:`, redisError.message);
                }
            }

            // Fallback para memória
            if (this.fallbackCache.has(key)) {
                const cached = this.fallbackCache.get(key);
                // Verificar se não expirou
                if (cached.expires > Date.now()) {
                    this.stats.hits++;
                    return cached.value;
                } else {
                    this.fallbackCache.delete(key);
                }
            }

            this.stats.misses++;
            return null;

        } catch (error) {
            console.error('❌ Erro no cache get:', error.message);
            this.stats.errors++;
            this.stats.misses++;
            return null;
        }
    }

    /**
     * Armazenar dados no cache
     */
    async set(key, value, ttl = this.defaultTTL.molds) {
        try {
            const jsonValue = JSON.stringify(value);

            // Tentar Redis primeiro
            if (this.isConnected && this.client) {
                try {
                    await this.client.setEx(key, ttl, jsonValue);
                    this.stats.sets++;
                    return true;
                } catch (redisError) {
                    console.warn(`⚠️ Redis set error para ${key}:`, redisError.message);
                }
            }

            // Fallback para memória
            this.fallbackCache.set(key, {
                value: value,
                expires: Date.now() + (ttl * 1000)
            });

            this.stats.sets++;
            return true;

        } catch (error) {
            console.error('❌ Erro no cache set:', error.message);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * Remover do cache
     */
    async del(key) {
        try {
            let deleted = false;

            // Redis
            if (this.isConnected && this.client) {
                try {
                    await this.client.del(key);
                    deleted = true;
                } catch (redisError) {
                    console.warn(`⚠️ Redis del error para ${key}:`, redisError.message);
                }
            }

            // Memória
            if (this.fallbackCache.has(key)) {
                this.fallbackCache.delete(key);
                deleted = true;
            }

            return deleted;

        } catch (error) {
            console.error('❌ Erro no cache del:', error.message);
            return false;
        }
    }

    // === MÉTODOS ESPECÍFICOS PARA CALCULADORA ===

    /**
     * Cache de formas/moldes
     */
    async getMold(moldId) {
        return await this.get(`mold:${moldId}`);
    }

    async setMold(moldId, moldData) {
        return await this.set(`mold:${moldId}`, moldData, this.defaultTTL.molds);
    }

    /**
     * Cache de bobinas
     */
    async getRoll(rollId) {
        return await this.get(`roll:${rollId}`);
    }

    async setRoll(rollId, rollData) {
        return await this.set(`roll:${rollId}`, rollData, this.defaultTTL.rolls);
    }

    /**
     * Cache de cálculos (hash baseado nos parâmetros)
     */
    async getCalculation(params) {
        const hash = this.generateCalculationHash(params);
        return await this.get(`calc:${hash}`);
    }

    async setCalculation(params, result) {
        const hash = this.generateCalculationHash(params);
        return await this.set(`calc:${hash}`, result, this.defaultTTL.calculations);
    }

    /**
     * Cache de usuários
     */
    async getUser(userId) {
        return await this.get(`user:${userId}`);
    }

    async setUser(userId, userData) {
        return await this.set(`user:${userId}`, userData, this.defaultTTL.users);
    }

    /**
     * Cache de projetos por usuário
     */
    async getUserProjects(userId) {
        return await this.get(`user:${userId}:projects`);
    }

    async setUserProjects(userId, projects) {
        return await this.set(`user:${userId}:projects`, projects, this.defaultTTL.projects);
    }

    /**
     * Invalidar cache de usuário (quando dados mudam)
     */
    async invalidateUser(userId) {
        await Promise.all([
            this.del(`user:${userId}`),
            this.del(`user:${userId}:projects`)
        ]);
    }

    // === UTILITÁRIOS ===

    /**
     * Gerar hash único para cálculos
     */
    generateCalculationHash(params) {
        const crypto = require('crypto');
        const normalizedParams = JSON.stringify(params, Object.keys(params).sort());
        return crypto.createHash('md5').update(normalizedParams).digest('hex');
    }

    /**
     * Limpar cache expirado da memória
     */
    cleanupMemoryCache() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, cached] of this.fallbackCache.entries()) {
            if (cached.expires <= now) {
                this.fallbackCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cache memória: ${cleaned} chaves expiradas removidas`);
        }
    }

    /**
     * Estatísticas do cache
     */
    getStats() {
        const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0;

        return {
            performance: this.stats,
            hitRate: `${hitRate.toFixed(1)}%`,
            redis: {
                connected: this.isConnected,
                status: this.isConnected ? 'healthy' : 'fallback'
            },
            memory: {
                keys: this.fallbackCache.size,
                fallbackActive: !this.isConnected
            }
        };
    }

    /**
     * Health check
     */
    async getHealth() {
        const stats = this.getStats();

        try {
            // Testar Redis se conectado
            if (this.isConnected && this.client) {
                const start = Date.now();
                await this.client.ping();
                const latency = Date.now() - start;

                return {
                    status: 'healthy',
                    type: 'redis',
                    latency: `${latency}ms`,
                    hitRate: stats.hitRate,
                    performance: stats.performance
                };
            } else {
                return {
                    status: 'fallback',
                    type: 'memory',
                    keys: stats.memory.keys,
                    hitRate: stats.hitRate,
                    performance: stats.performance
                };
            }

        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * Cleanup na finalização
     */
    async close() {
        if (this.client) {
            await this.client.quit();
        }
        this.fallbackCache.clear();
        console.log('🔌 Cache Redis desconectado');
    }
}

// Singleton instance
const redisCache = new RedisCacheService();

// Cleanup automático da memória a cada 10 minutos
setInterval(() => {
    redisCache.cleanupMemoryCache();
}, 10 * 60 * 1000);

module.exports = redisCache;
