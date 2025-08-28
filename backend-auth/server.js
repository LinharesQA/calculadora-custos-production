const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');

// Performance middleware
const { compressionMiddleware, basicLimit } = require('./middleware/performance');

// Configurar dotenv baseado no ambiente
const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: path.join(__dirname, envFile) });

// Importar configurações
require('./config/passport');
const { sequelize } = require('./config/database');
const dbPool = require('./services/databasePool');
const redisSession = require('./services/redisSession');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const moldsRoutes = require('./routes/molds');
const rollsRoutes = require('./routes/rolls');
const projectsRoutes = require('./routes/projects');
const calculationsRoutes = require('./routes/calculations');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar trust proxy para EasyPanel
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX || 100, // máximo 100 requests por IP
    message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
});

// Middlewares de segurança
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.github.com"]
        }
    }
}));

app.use(compressionMiddleware);
app.use(basicLimit);

// CORS configurado para o frontend
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5500',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Função para configurar sessões Redis ou fallback
async function setupSessions() {
    try {
        console.log('🔄 Configurando sistema de sessões...');

        // Tentar conectar ao Redis (não bloquear se falhar)
        await redisSession.createConnection();

        // Configurar sessões (Redis ou MemoryStore)
        const sessionConfig = redisSession.getSessionConfig();
        app.use(session(sessionConfig));

        console.log('✅ Sistema de sessões configurado');
        return true;
    } catch (error) {
        console.error('❌ Erro ao configurar sessões:', error.message);

        // Fallback para MemoryStore simples
        console.log('🔄 Usando fallback para sessões em memória...');
        app.use(session({
            secret: process.env.SESSION_SECRET || 'dev_session_secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            },
            name: 'sessionId'
        }));

        console.log('✅ Sistema de sessões fallback configurado');
        return false;
    }
}

// Passport será inicializado DEPOIS das sessões na função startServer// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'SublimaCalc Backend',
        version: '1.0.0'
    });
});

// Health check do banco de dados
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'SublimaCalc Backend',
            version: '1.0.0',
            database: 'Connected',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            service: 'SublimaCalc Backend',
            version: '1.0.0',
            database: 'Disconnected',
            error: error.message
        });
    }
});

app.get('/api/health/db', async (req, res) => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SELECT 1 as alive');
        res.status(200).json({
            status: 'OK',
            database: 'Connected',
            query_test: results[0]?.alive === 1 ? 'OK' : 'FAIL',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            database: 'Error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check do pool de conexões
app.get('/api/health/pool', async (req, res) => {
    try {
        const poolHealth = dbPool.getHealth();
        const poolStats = dbPool.getStats();

        res.status(poolHealth.status === 'healthy' ? 200 : 200).json({
            status: poolHealth.status,
            pool: poolStats,
            health: poolHealth,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check do Redis e sessões
app.get('/api/health/redis', async (req, res) => {
    try {
        const redisHealth = await redisSession.getHealth();
        const sessionStats = await redisSession.getSessionStats();

        res.status(redisHealth.status === 'healthy' ? 200 : 200).json({
            status: redisHealth.status,
            redis: redisHealth,
            sessions: sessionStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check geral do sistema
app.get('/api/health/system', async (req, res) => {
    try {
        const [redisHealth, poolHealth, sessionStats] = await Promise.all([
            redisSession.getHealth(),
            Promise.resolve(dbPool.getHealth()),
            redisSession.getSessionStats()
        ]);

        const overallStatus =
            redisHealth.status === 'healthy' &&
                (poolHealth.status === 'healthy' || poolHealth.status === 'disabled')
                ? 'healthy' : 'degraded';

        res.status(overallStatus === 'healthy' ? 200 : 206).json({
            status: overallStatus,
            components: {
                redis: redisHealth,
                database: poolHealth,
                sessions: sessionStats
            },
            performance: {
                activeSessions: sessionStats.activeSessions || 0,
                connections: poolHealth.connectionCount || 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/molds', moldsRoutes);
app.use('/api/rolls', rollsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects', calculationsRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('Erro:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: err.errors?.map(e => e.message) || []
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Token inválido ou expirado'
        });
    }

    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Conectar ao banco de dados
        await sequelize.authenticate();
        console.log('✅ Conexão com banco de dados estabelecida');

        // Configurar sessões Redis
        await setupSessions();

        // Configurar Passport APÓS as sessões
        app.use(passport.initialize());
        app.use(passport.session());
        console.log('✅ Passport configurado com sessões');

        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados com o banco');
        }

        // Inicializar pool de conexões (produção)
        if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
            dbPool.createPool();
            console.log('🔄 Pool de conexões PostgreSQL inicializado');
        }

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 API disponível em http://0.0.0.0:${PORT}`);
            console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Encerrando servidor...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Encerrando servidor...');
    await sequelize.close();
    process.exit(0);
});

startServer();
