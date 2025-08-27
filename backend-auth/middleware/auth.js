const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware de autenticação JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Token de acesso necessário'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuário no banco
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!user || !user.is_active) {
            return res.status(401).json({
                error: 'Usuário não encontrado ou inativo'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }

        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            error: 'Erro interno de autenticação'
        });
    }
};

// Middleware para verificar se o recurso pertence ao usuário
const checkOwnership = (resourceName) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Buscar o recurso no banco
            const { [resourceName]: Model } = require('../models');
            const resource = await Model.findByPk(id);

            if (!resource) {
                return res.status(404).json({
                    error: `${resourceName} não encontrado`
                });
            }

            if (resource.user_id !== userId) {
                return res.status(403).json({
                    error: 'Acesso negado: recurso não pertence ao usuário'
                });
            }

            req.resource = resource;
            next();

        } catch (error) {
            console.error('Erro na verificação de propriedade:', error);
            return res.status(500).json({
                error: 'Erro interno na verificação de acesso'
            });
        }
    };
};

// Middleware para validar dados de entrada
const validateInput = (validationRules) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(validationRules)) {
            const value = req.body[field];

            if (rules.required && (!value || value.toString().trim() === '')) {
                errors.push(`Campo '${field}' é obrigatório`);
                continue;
            }

            if (value && rules.type) {
                if (rules.type === 'number' && isNaN(Number(value))) {
                    errors.push(`Campo '${field}' deve ser um número`);
                }

                if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push(`Campo '${field}' deve ser um email válido`);
                }

                if (rules.type === 'string' && typeof value !== 'string') {
                    errors.push(`Campo '${field}' deve ser um texto`);
                }
            }

            if (value && rules.min && Number(value) < rules.min) {
                errors.push(`Campo '${field}' deve ser maior que ${rules.min}`);
            }

            if (value && rules.max && Number(value) > rules.max) {
                errors.push(`Campo '${field}' deve ser menor que ${rules.max}`);
            }

            if (value && rules.minLength && value.toString().length < rules.minLength) {
                errors.push(`Campo '${field}' deve ter pelo menos ${rules.minLength} caracteres`);
            }

            if (value && rules.maxLength && value.toString().length > rules.maxLength) {
                errors.push(`Campo '${field}' deve ter no máximo ${rules.maxLength} caracteres`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors
            });
        }

        next();
    };
};

// Middleware para logs de auditoria
const auditLog = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            // Log da ação (em produção, salvar em arquivo ou banco)
            if (process.env.NODE_ENV === 'development') {
                console.log(`[AUDIT] ${new Date().toISOString()} - User: ${req.user?.id} - Action: ${action} - IP: ${req.ip}`);
            }

            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    authenticateToken,
    checkOwnership,
    validateInput,
    auditLog
};
