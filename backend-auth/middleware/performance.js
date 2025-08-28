const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');

// Rate limiting básico
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'Muitas tentativas. Tente novamente em alguns minutos.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Slow down progressivo
const createSlowDown = (windowMs = 15 * 60 * 1000, delayAfter = 50) => {
    return slowDown({
        windowMs,
        delayAfter,
        delayMs: () => 500,
        maxDelayMs: 20000,
        validate: { delayMs: false }
    });
};

// Middleware de compressão
const compressionMiddleware = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
});

module.exports = {
    createRateLimit,
    createSlowDown,
    compressionMiddleware,

    // Configurações pré-definidas
    basicLimit: createRateLimit(15 * 60 * 1000, 100), // 100 req/15min
    authLimit: createRateLimit(15 * 60 * 1000, 30),   // 30 req/15min para auth
    apiLimit: createRateLimit(15 * 60 * 1000, 200),   // 200 req/15min para API

    basicSlowDown: createSlowDown(15 * 60 * 1000, 50), // slowdown após 50 req
};