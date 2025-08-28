// Testando se o problema é na definição da classe
console.log('Starting databasePool module...');

const { Pool } = require('pg');

console.log('Pool loaded:', typeof Pool);

class DatabasePool {
    constructor() {
        console.log('DatabasePool constructor called');
        this.pool = null;
        this.isConnected = false;
        this.connectionCount = 0;
        this.errorCount = 0;
        this.lastError = null;
    }

    createPool() {
        console.log('createPool method called');
        const databaseUrl = process.env.DATABASE_URL;
        const nodeEnv = process.env.NODE_ENV || 'development';

        if (!databaseUrl || nodeEnv !== 'production') {
            console.log('🔄 DatabasePool: Usando Sequelize para desenvolvimento');
            return null;
        }

        console.log('🔄 Criando pool de conexões PostgreSQL otimizado...');

        this.pool = new Pool({
            connectionString: databaseUrl,
            max: 25,
            min: 8,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            application_name: 'sublimacalc_backend',
            statement_timeout: 30000,
            query_timeout: 25000,
            allowExitOnIdle: false,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : false
        });

        this.pool.on('connect', (client) => {
            this.connectionCount++;
            this.isConnected = true;
            console.log(`✅ Nova conexão criada (Total: ${this.connectionCount})`);
        });

        this.pool.on('remove', (client) => {
            this.connectionCount--;
            console.log(`🔄 Conexão removida (Total: ${this.connectionCount})`);
        });

        this.pool.on('error', (err) => {
            this.errorCount++;
            this.lastError = err;
            console.error('❌ Erro no pool de conexões:', err.message);
        });

        return this.pool;
    }

    getHealth() {
        if (!this.pool) {
            return {
                status: 'disabled',
                message: 'Pool não está ativo (desenvolvimento)'
            };
        }

        return {
            status: this.isConnected ? 'healthy' : 'unhealthy',
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
            connectionCount: this.connectionCount,
            errorCount: this.errorCount,
            isConnected: this.isConnected,
            lastError: this.lastError ? this.lastError.message : null
        };
    }
}

console.log('Creating DatabasePool instance...');
const dbPool = new DatabasePool();
console.log('Instance created:', typeof dbPool);
console.log('createPool method:', typeof dbPool.createPool);

module.exports = dbPool;
