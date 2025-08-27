# Script de Instalação Automática - SublimaCalc Backend
# Execute este script para configurar tudo automaticamente

Write-Host "🚀 SublimaCalc Backend - Instalação Automática" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "📥 Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se npm está disponível
Write-Host "🔍 Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

# Verificar se PostgreSQL está rodando
Write-Host ""
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgProcess = Get-Process postgres -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✅ PostgreSQL está rodando" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL não encontrado rodando" -ForegroundColor Yellow
        Write-Host "💡 Você pode:" -ForegroundColor Cyan
        Write-Host "   1. Instalar PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "   2. Usar Docker: docker run --name sublimacalc-postgres -e POSTGRES_DB=sublimacalc -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:13" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar PostgreSQL" -ForegroundColor Yellow
}

# Configurar arquivo .env
Write-Host "⚙️  Configurando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "📄 Arquivo .env já existe" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Arquivo .env criado a partir do exemplo" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 CONFIGURAÇÕES NECESSÁRIAS:" -ForegroundColor Red -BackgroundColor Yellow
    Write-Host "   1. Edite o arquivo .env" -ForegroundColor Yellow
    Write-Host "   2. Configure suas credenciais do PostgreSQL" -ForegroundColor Yellow
    Write-Host "   3. Configure Google OAuth (Google Cloud Console)" -ForegroundColor Yellow
    Write-Host "   4. Gere uma chave JWT_SECRET segura" -ForegroundColor Yellow
    Write-Host ""
}

# Gerar JWT Secret se não existir
Write-Host "🔐 Verificando JWT Secret..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "JWT_SECRET=sua_chave_jwt_super_secreta_aqui") {
    $jwtSecret = -join ((1..64) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
    $envContent = $envContent -replace "JWT_SECRET=sua_chave_jwt_super_secreta_aqui", "JWT_SECRET=$jwtSecret"
    Set-Content ".env" $envContent
    Write-Host "✅ JWT Secret gerado automaticamente" -ForegroundColor Green
} else {
    Write-Host "✅ JWT Secret já configurado" -ForegroundColor Green
}

# Instruções finais
Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host ""
Write-Host "1. 🗄️  Configure o PostgreSQL:" -ForegroundColor White
Write-Host "   • DB_PASSWORD no arquivo .env" -ForegroundColor Gray
Write-Host "   • Crie o banco: createdb sublimacalc" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔑 Configure Google OAuth:" -ForegroundColor White
Write-Host "   • Acesse: https://console.cloud.google.com/" -ForegroundColor Gray
Write-Host "   • Crie credenciais OAuth 2.0" -ForegroundColor Gray
Write-Host "   • Adicione no .env: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🏗️  Setup do banco de dados:" -ForegroundColor White
Write-Host "   • npm run setup" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🚀 Iniciar o servidor:" -ForegroundColor White
Write-Host "   • npm run dev (desenvolvimento)" -ForegroundColor Gray
Write-Host "   • npm start (produção)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 🌐 Testar:" -ForegroundColor White
Write-Host "   • http://localhost:3001/health" -ForegroundColor Gray
Write-Host "   • http://localhost:3001/api/auth/google" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Consulte o README.md para instruções detalhadas!" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Instalação concluída! Boa sorte! 🎉" -ForegroundColor Green
