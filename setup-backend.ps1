# Setup Backend - SublimaCalc
# Script para configurar e instalar o backend completo

Write-Host "=== SublimaCalc Backend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar se PostgreSQL está instalado
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro." -ForegroundColor Red
    Write-Host "Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Navegar para a pasta backend
Write-Host ""
Write-Host "📂 Configurando backend..." -ForegroundColor Yellow

if (!(Test-Path "backend-auth")) {
    Write-Host "✗ Pasta backend-auth não encontrada!" -ForegroundColor Red
    exit 1
}

Set-Location backend-auth

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependências instaladas com sucesso!" -ForegroundColor Green

# Configurar variáveis de ambiente
Write-Host ""
Write-Host "🔧 Configurando variáveis de ambiente..." -ForegroundColor Yellow

$envContent = @"
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sublimacalc
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sublimacalc
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=sublimacalc_jwt_secret_$(Get-Random -Minimum 100000 -Maximum 999999)
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Security
SESSION_SECRET=sublimacalc_session_secret_$(Get-Random -Minimum 100000 -Maximum 999999)
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green

# Mostrar próximos passos
Write-Host ""
Write-Host "🚀 Backend configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o PostgreSQL e crie o banco 'sublimacalc'" -ForegroundColor White
Write-Host "2. Configure o Google OAuth no console do Google" -ForegroundColor White
Write-Host "3. Atualize as credenciais no arquivo .env" -ForegroundColor White
Write-Host "4. Execute 'npm run setup-db' para criar as tabelas" -ForegroundColor White
Write-Host "5. Execute 'npm start' para iniciar o servidor" -ForegroundColor White
Write-Host ""

# Configurar banco de dados
$setupDb = Read-Host "Deseja configurar o banco de dados agora? (s/N)"
if ($setupDb -eq "s" -or $setupDb -eq "S") {
    Write-Host ""
    Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Yellow
    
    # Tentar conectar ao PostgreSQL
    try {
        Write-Host "Tentando conectar ao PostgreSQL..." -ForegroundColor Gray
        
        # Criar banco se não existir
        $createDbQuery = "SELECT 1 FROM pg_database WHERE datname = 'sublimacalc'"
        $dbExists = psql -U postgres -h localhost -t -c $createDbQuery 2>$null
        
        if (!$dbExists -or $dbExists.Trim() -eq "") {
            Write-Host "Criando banco de dados 'sublimacalc'..." -ForegroundColor Gray
            createdb -U postgres -h localhost sublimacalc
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Banco de dados criado!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Erro ao criar banco. Verifique as credenciais do PostgreSQL." -ForegroundColor Yellow
            }
        } else {
            Write-Host "✓ Banco de dados já existe!" -ForegroundColor Green
        }
        
        # Executar setup do banco
        npm run setup-db
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Tabelas criadas com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Erro ao criar tabelas. Verifique a conexão." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "⚠️ Erro ao configurar banco. Configure manualmente depois." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Para configurar o Google OAuth:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Crie um projeto ou selecione um existente" -ForegroundColor White
Write-Host "3. Habilite a Google Sign-In API" -ForegroundColor White
Write-Host "4. Configure as URLs de redirect:" -ForegroundColor White
Write-Host "   - http://localhost:3000/auth/google/callback" -ForegroundColor Gray
Write-Host "5. Copie Client ID e Client Secret para o .env" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar o servidor:" -ForegroundColor Cyan
Write-Host "cd backend-auth && npm start" -ForegroundColor White
