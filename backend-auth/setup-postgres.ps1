# SublimaCalc - PostgreSQL Setup Script
# Script para configurar PostgreSQL automaticamente

Write-Host "=== SublimaCalc - PostgreSQL Setup ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está instalado
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Download PostgreSQL:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🔧 Ou instale via Chocolatey:" -ForegroundColor Yellow
    Write-Host "choco install postgresql" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Verificar arquivo .env
if (!(Test-Path ".env")) {
    Write-Host "✗ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "Copie .env.example para .env e configure as credenciais." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Arquivo .env encontrado" -ForegroundColor Green

# Ler configurações do .env
$envContent = Get-Content ".env" | Where-Object { $_ -notmatch "^#" -and $_ -match "=" }
$envVars = @{}

foreach ($line in $envContent) {
    if ($line -match "^([^=]+)=(.*)$") {
        $envVars[$matches[1]] = $matches[2]
    }
}

$dbHost = $envVars["DB_HOST"] ?? "localhost"
$dbPort = $envVars["DB_PORT"] ?? "5432"
$dbName = $envVars["DB_NAME"] ?? "sublimacalc"
$dbUser = $envVars["DB_USER"] ?? "postgres"
$dbPassword = $envVars["DB_PASSWORD"] ?? "postgres"

Write-Host ""
Write-Host "🔧 Configuração detectada:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Porta: $dbPort" -ForegroundColor Gray
Write-Host "  Banco: $dbName" -ForegroundColor Gray
Write-Host "  Usuário: $dbUser" -ForegroundColor Gray
Write-Host ""

# Testar conexão PostgreSQL
Write-Host "🔌 Testando conexão PostgreSQL..." -ForegroundColor Yellow

$env:PGPASSWORD = $dbPassword
try {
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "SELECT version();" -t 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Conexão PostgreSQL OK!" -ForegroundColor Green
    } else {
        throw "Falha na conexão"
    }
} catch {
    Write-Host "✗ Erro na conexão PostgreSQL!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se PostgreSQL está rodando:" -ForegroundColor White
    Write-Host "   net start postgresql-x64-*" -ForegroundColor Gray
    Write-Host "2. Confirme usuário e senha no .env" -ForegroundColor White
    Write-Host "3. Verifique host e porta" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Criar banco se não existir
Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Yellow

try {
    # Verificar se banco existe
    $dbExists = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName';" 2>$null
    
    if ($dbExists -and $dbExists.Trim() -eq "1") {
        Write-Host "✓ Banco '$dbName' já existe" -ForegroundColor Green
    } else {
        Write-Host "Criando banco '$dbName'..." -ForegroundColor Gray
        createdb -h $dbHost -p $dbPort -U $dbUser $dbName 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Banco '$dbName' criado!" -ForegroundColor Green
        } else {
            throw "Erro ao criar banco"
        }
    }
} catch {
    Write-Host "✗ Erro ao configurar banco!" -ForegroundColor Red
    exit 1
}

# Executar setup das tabelas
Write-Host "📋 Criando tabelas..." -ForegroundColor Yellow

try {
    npm run setup-db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Tabelas criadas com sucesso!" -ForegroundColor Green
    } else {
        throw "Erro no setup das tabelas"
    }
} catch {
    Write-Host "✗ Erro ao criar tabelas!" -ForegroundColor Red
    Write-Host "Execute manualmente: npm run setup-db" -ForegroundColor Yellow
}

# Limpar variável de senha
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 PostgreSQL configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "npm run db:status    - Testar conexão" -ForegroundColor White
Write-Host "npm run db:backup    - Fazer backup" -ForegroundColor White
Write-Host "npm run db:restore   - Restaurar backup" -ForegroundColor White
Write-Host "npm run setup-db     - Recriar tabelas" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Próximo: Configure Google OAuth no .env" -ForegroundColor Yellow
