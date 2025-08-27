const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Importar configurações
require('./config/passport');
const { sequelize } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const moldsRoutes = require('./routes/molds');
const rollsRoutes = require('./routes/rolls');
const projectsRoutes = require('./routes/projects');
const calculationsRoutes = require('./routes/calculations');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use(compression());
app.use(limiter);

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
app.use(passport.initialize());

// Health check
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

        // Sincronizar modelos (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados com o banco');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 API disponível em http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
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
