const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rota para iniciar autenticação Google
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Callback do Google OAuth
router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            const user = req.user;

            // Gerar JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
                }
            );

            // Atualizar último login
            await user.update({ last_login: new Date() });

            // Redirecionar para frontend com token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${frontendUrl}/index-modern.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }))}`;

            res.redirect(redirectUrl);

        } catch (error) {
            console.error('Erro no callback Google:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/?error=auth_failed`);
        }
    }
);

// Verificar token atual
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'avatar', 'last_login']
        });

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                lastLogin: user.last_login
            }
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Logout (invalidar token no frontend)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Em uma implementação mais robusta, você manteria uma blacklist de tokens
        // Por enquanto, o logout acontece no frontend removendo o token

        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const user = req.user;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                error: 'Nome deve ter pelo menos 2 caracteres'
            });
        }

        await user.update({
            name: name.trim()
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Erro na atualização do perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

// Deletar conta do usuário
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        // Soft delete - marcar como inativo
        await user.update({
            is_active: false,
            email: `deleted_${Date.now()}_${user.email}` // Para permitir re-cadastro com mesmo email
        });

        res.json({
            success: true,
            message: 'Conta deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro na deleção da conta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
