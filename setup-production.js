#!/usr/bin/env node

/**
 * Script de configuração para produção
 * Prepara o sistema para deploy no EasyPanel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando sistema para produção...\n');

// 1. Verificar estrutura de arquivos necessários
const requiredFiles = [
    'package.json',
    'backend-auth/package.json',
    'backend-auth/server.js',
    'backend-auth/config/database.js',
    'easypanel.json'
];

console.log('📁 Verificando arquivos necessários...');
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - ARQUIVO FALTANDO!`);
        process.exit(1);
    }
}

// 2. Verificar variáveis de ambiente necessárias
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
];

console.log('\n🔧 Variáveis de ambiente para configurar no EasyPanel:');
for (const envVar of requiredEnvVars) {
    console.log(`   📝 ${envVar}=${process.env[envVar] || '[CONFIGURAR NO EASYPANEL]'}`);
}

// 3. Verificar dependências
console.log('\n📦 Verificando dependências...');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const backendPkg = JSON.parse(fs.readFileSync('backend-auth/package.json', 'utf8'));

    console.log(`   ✅ Frontend: ${pkg.name}@${pkg.version}`);
    console.log(`   ✅ Backend: ${backendPkg.name}@${backendPkg.version}`);

    // Verificar dependências críticas do backend
    const criticalDeps = ['express', 'sequelize', 'pg', 'jsonwebtoken', 'bcryptjs'];
    for (const dep of criticalDeps) {
        if (backendPkg.dependencies[dep]) {
            console.log(`   ✅ ${dep}: ${backendPkg.dependencies[dep]}`);
        } else {
            console.log(`   ❌ ${dep}: DEPENDÊNCIA FALTANDO!`);
        }
    }
} catch (error) {
    console.log(`   ❌ Erro ao verificar dependências: ${error.message}`);
}

// 4. Criar arquivo .env.example para referência
const envExample = `# Variáveis de ambiente para produção no EasyPanel

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
# ou separadamente:
DB_HOST=postgres_host
DB_PORT=5432
DB_NAME=sublimacalc_prod
DB_USER=sublimacalc_user
DB_PASSWORD=senha_segura

# JWT para autenticação
JWT_SECRET=uma_chave_super_secreta_de_pelo_menos_256_bits

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Configuração de ambiente
NODE_ENV=production
PORT=3000

# CORS - URL do frontend
FRONTEND_URL=https://sua-calculadora.easypanel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;

fs.writeFileSync('.env.example', envExample);
console.log('\n📝 Arquivo .env.example criado para referência');

// 5. Instruções finais
console.log('\n🎯 PRÓXIMOS PASSOS PARA DEPLOY:');
console.log('\n1. 🗄️ BANCO DE DADOS:');
console.log('   - Criar banco PostgreSQL no EasyPanel');
console.log('   - Copiar DATABASE_URL das configurações');

console.log('\n2. 🔧 VARIÁVEIS DE AMBIENTE:');
console.log('   - Configurar todas as variáveis listadas acima');
console.log('   - Gerar JWT_SECRET seguro: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');

console.log('\n3. 🚀 DEPLOY:');
console.log('   - Push para repositório Git');
console.log('   - Conectar repo ao EasyPanel');
console.log('   - Configurar 2 serviços: frontend (static) + backend (nodejs)');
console.log('   - Executar migration do banco na primeira vez');

console.log('\n4. ✅ TESTE:');
console.log('   - Acessar frontend');
console.log('   - Testar login/registro');
console.log('   - Verificar health checks:');
console.log('     GET /api/health');
console.log('     GET /api/health/db');

console.log('\n🎉 Sistema pronto para produção!\n');
