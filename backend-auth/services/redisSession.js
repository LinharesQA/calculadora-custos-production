const redis = require('redis');

class RedisSessionManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Criar conexão Redis otimizada para sessões
    async createConnection() {
        const redisUrl = process.env.REDIS_URL;
        const nodeEnv = process.env.NODE_ENV || 'development';

        // Se não há URL do Redis, usar modo desenvolvimento
        if (!redisUrl) {
            console.log('🔄 Redis: URL não configurada - usando sessões em memória');
            return null;
        }

        console.log('🔄 Conectando ao Redis para sessões...');

        try {
            this.client = redis.createClient({
                url: redisUrl,
                // Configurações otimizadas para sessões
                retry_delay_on_failover: 100,
                retry_delay_on_cluster_down: 300,
                max_attempts: 3, // Reduzido para produção

                // Pool de conexões para performance
                socket: {
                    keepAlive: true,
                    connectTimeout: 5000, // 5s timeout para conectar
                    reconnectStrategy: (retries) => {
                        if (retries >= 3) {
                            console.error('❌ Redis: Máximo de tentativas atingido - continuando sem Redis');
                            return false;
                        }
                        const delay = Math.min(retries * 1000, 3000);
                        console.log(`🔄 Redis: Tentativa ${retries + 1}/3 em ${delay}ms`);
                        return delay;
                    }
                }
            });            // Event listeners para monitoramento
            this.client.on('connect', () => {
                console.log('🔌 Redis: Conectando...');
            });

            this.client.on('ready', () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Redis: Conexão estabelecida para sessões');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                console.error('❌ Redis Error:', err.message);
            });

            this.client.on('end', () => {
                this.isConnected = false;
                console.log('🔄 Redis: Conexão encerrada');
            });

            this.client.on('reconnecting', () => {
                this.reconnectAttempts++;
                console.log(`🔄 Redis: Reconectando (tentativa ${this.reconnectAttempts})...`);
            });

            // Conectar
            await this.client.connect();

            // Testar conexão
            await this.client.ping();
            console.log('✅ Redis: Ping bem-sucedido');

            return this.client;

        } catch (error) {
            console.error('❌ Erro ao conectar Redis:', error.message);
            this.isConnected = false;

            // Em produção, Redis é obrigatório
            if (nodeEnv === 'production') {
                throw error;
            }

            console.log('⚠️ Continuando sem Redis em desenvolvimento');
            return null;
        }
    }

    // Configuração de sessão otimizada
    getSessionConfig() {
        const nodeEnv = process.env.NODE_ENV || 'development';

        const baseConfig = {
            name: 'sublimacalc_session',
            secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
            resave: false,
            saveUninitialized: false,
            rolling: true, // Renovar TTL a cada request

            cookie: {
                secure: nodeEnv === 'production', // HTTPS em produção
                httpOnly: true, // Prevenir XSS
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                sameSite: nodeEnv === 'production' ? 'strict' : 'lax'
            }
        };

        // Se Redis disponível, usar Redis store
        if (this.client && this.isConnected) {
            const RedisStore = require('connect-redis').default;

            baseConfig.store = new RedisStore({
                client: this.client,
                prefix: 'sublimacalc:sess:',
                ttl: 24 * 60 * 60, // 24 horas em segundos
                disableTouch: false, // Permitir renovação de TTL
                disableTTL: false
            });

            console.log('✅ Session: Usando Redis store');
        } else {
            console.log('⚠️ Session: Usando MemoryStore (desenvolvimento)');
        }

        return baseConfig;
    }

    // Health check do Redis
    async getHealth() {
        if (!this.client) {
            return {
                status: 'disabled',
                message: 'Redis não configurado (desenvolvimento)'
            };
        }

        try {
            const start = Date.now();
            await this.client.ping();
            const latency = Date.now() - start;

            const info = await this.client.info('memory');
            const memory = this.parseRedisInfo(info);

            return {
                status: this.isConnected ? 'healthy' : 'unhealthy',
                latency: `${latency}ms`,
                connected: this.isConnected,
                reconnectAttempts: this.reconnectAttempts,
                memory: {
                    used: memory.used_memory_human || 'N/A',
                    peak: memory.used_memory_peak_human || 'N/A'
                }
            };

        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                connected: false
            };
        }
    }

    // Estatísticas de sessões
    async getSessionStats() {
        if (!this.client || !this.isConnected) {
            return { status: 'disabled' };
        }

        try {
            const keys = await this.client.keys('sublimacalc:sess:*');
            const activeSessions = keys.length;

            // TTL médio das sessões ativas
            let totalTtl = 0;
            if (activeSessions > 0) {
                const ttls = await Promise.all(
                    keys.slice(0, 10).map(key => this.client.ttl(key))
                );
                totalTtl = ttls.reduce((sum, ttl) => sum + (ttl > 0 ? ttl : 0), 0);
            }

            return {
                activeSessions,
                avgTtl: activeSessions > 0 ? Math.round(totalTtl / Math.min(10, activeSessions)) : 0,
                prefix: 'sublimacalc:sess:'
            };

        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    // Parser de info do Redis
    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const result = {};

        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        });

        return result;
    }

    // Fechar conexão
    async close() {
        if (this.client) {
            console.log('🔄 Redis: Fechando conexão...');
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
            console.log('✅ Redis: Conexão fechada');
        }
    }
}

// Instância singleton
const redisSession = new RedisSessionManager();

module.exports = redisSession;
