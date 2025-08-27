// Teste simples do backend
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    console.log('Health check chamado');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
    console.log('Rota de teste chamada');
    res.json({ message: 'Backend funcionando!' });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}/health`);
});
