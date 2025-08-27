const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Redirecionar a raiz para index-modern.html
app.get('/', (req, res) => {
    res.redirect('/index-modern.html');
});

// Fallback para SPA (se necessário)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index-modern.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Frontend server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'frontend')}`);
    console.log(`🔗 Login page: http://localhost:${PORT}/index-modern.html`);
    console.log(`🔗 Dashboard: http://localhost:${PORT}/app.html`);
});
