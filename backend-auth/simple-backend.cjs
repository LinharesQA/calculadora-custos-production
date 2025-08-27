const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Health check simples
app.get('/health', (req, res) => {
    console.log('Health check acessado');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Backend funcionando!'
    });
});

// API de teste
app.get('/api/auth/verify', (req, res) => {
    console.log('Verify endpoint acessado');
    res.json({
        success: false,
        error: 'Token necessário'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Servidor TESTE rodando na porta ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
