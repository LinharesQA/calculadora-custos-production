# SublimaCalc - Complete Deployment Script
# Script para deploy completo da aplicação

Write-Host "=== SublimaCalc Deploy Script ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos na pasta correta
if (!(Test-Path "package.json")) {
    Write-Host "✗ Execute este script na pasta raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verificar dependências
Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado!" -ForegroundColor Red
    exit 1
}

# PostgreSQL
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PostgreSQL não encontrado (necessário para produção)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Configurando projeto..." -ForegroundColor Yellow

# Instalar dependências do frontend
if (Test-Path "package.json") {
    Write-Host "Instalando dependências do frontend..." -ForegroundColor Gray
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Erro ao instalar dependências do frontend!" -ForegroundColor Red
        exit 1
    }
}

# Configurar backend se existir
if (Test-Path "backend-auth") {
    Write-Host "Configurando backend..." -ForegroundColor Gray
    Set-Location backend-auth
    
    if (!(Test-Path ".env")) {
        Write-Host "Criando arquivo .env do backend..." -ForegroundColor Gray
        
        $backendEnv = @"
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/sublimacalc
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sublimacalc
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration  
JWT_SECRET=sublimacalc_production_secret_$(Get-Random -Minimum 100000 -Maximum 999999)
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://sublimacalc.app

# Security
SESSION_SECRET=sublimacalc_session_$(Get-Random -Minimum 100000 -Maximum 999999)
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@
        
        $backendEnv | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green
    }
    
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Erro ao instalar dependências do backend!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "🏗️ Preparando build..." -ForegroundColor Yellow

# Build do frontend
if (Test-Path "vite.config.js") {
    Write-Host "Executando build do Vite..." -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Erro no build do Vite!" -ForegroundColor Red
        exit 1
    }
}

# Criar estrutura de deploy
$deployFolder = "deploy-sublimacalc"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

Write-Host ""
Write-Host "📁 Criando pacote de deploy..." -ForegroundColor Yellow

# Copiar arquivos principais
Copy-Item "index-modern.html" "$deployFolder/" -ErrorAction SilentlyContinue
Copy-Item "app.html" "$deployFolder/" -ErrorAction SilentlyContinue
Copy-Item "index.html" "$deployFolder/" -ErrorAction SilentlyContinue

# Copiar pastas necessárias
$foldersToInclude = @("js", "css", "assets", "src", "backend-auth")
foreach ($folder in $foldersToInclude) {
    if (Test-Path $folder) {
        Copy-Item $folder "$deployFolder/" -Recurse -ErrorAction SilentlyContinue
        Write-Host "✓ Copiado: $folder" -ForegroundColor Green
    }
}

# Copiar arquivos de configuração
$configFiles = @(
    "package.json",
    "package-lock.json", 
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "Dockerfile",
    "easypanel.json",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item $file "$deployFolder/" -ErrorAction SilentlyContinue
        Write-Host "✓ Copiado: $file" -ForegroundColor Green
    }
}

# Copiar build se existir
if (Test-Path "dist") {
    Copy-Item "dist" "$deployFolder/" -Recurse
    Write-Host "✓ Build copiado" -ForegroundColor Green
}

# Criar scripts de produção
$startScript = @"
#!/bin/bash
# SublimaCalc Production Start Script

echo "🚀 Iniciando SublimaCalc..."

# Verificar se o backend existe
if [ -d "backend-auth" ]; then
    echo "📡 Iniciando backend..."
    cd backend-auth
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências do backend..."
        npm install
    fi
    
    # Configurar banco de dados
    echo "🗄️ Configurando banco de dados..."
    npm run setup-db
    
    # Iniciar servidor
    echo "🌐 Iniciando servidor..."
    npm start &
    
    cd ..
fi

# Servir frontend (usando http-server ou similar)
if command -v npx &> /dev/null; then
    echo "🌍 Servindo frontend na porta 8080..."
    npx http-server . -p 8080 -c-1
else
    echo "⚠️ npx não encontrado. Sirva os arquivos HTML manualmente."
fi
"@

$startScript | Out-File -FilePath "$deployFolder/start.sh" -Encoding UTF8

# Criar script de instalação
$installScript = @"
#!/bin/bash
# SublimaCalc Installation Script

echo "=== SublimaCalc Installation ==="

# Instalar dependências globais
echo "📦 Instalando http-server..."
npm install -g http-server

# Configurar backend se existir
if [ -d "backend-auth" ]; then
    echo "🔧 Configurando backend..."
    cd backend-auth
    npm install
    cd ..
fi

echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar:"
echo "./start.sh"
"@

$installScript | Out-File -FilePath "$deployFolder/install.sh" -Encoding UTF8

# Criar README de deploy
$deployReadme = @"
# SublimaCalc - Deploy Package

## Instalação Rápida

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL (para backend)
- Git

### 2. Instalação
```bash
# Dar permissão aos scripts
chmod +x install.sh start.sh

# Instalar dependências
./install.sh
```

### 3. Configuração

#### Backend (se aplicável)
1. Configure PostgreSQL
2. Edite `backend-auth/.env`:
   - Credenciais do banco
   - Google OAuth (Client ID e Secret)
   - URLs de produção

#### Frontend
- Arquivos prontos para servir
- Use qualquer servidor HTTP

### 4. Execução
```bash
# Iniciar aplicação completa
./start.sh

# Ou apenas frontend
npx http-server . -p 8080
```

### 5. Google OAuth Setup
1. Acesse: https://console.cloud.google.com/
2. Crie projeto ou selecione existente
3. Habilite Google Sign-In API
4. Configure redirect URLs:
   - Desenvolvimento: http://localhost:3000/auth/google/callback
   - Produção: https://seu-dominio.com/auth/google/callback
5. Copie credenciais para .env

### 6. Deploy em Serviços

#### EasyPanel
1. Upload dos arquivos
2. Configure variáveis de ambiente
3. Execute install.sh
4. Configure domínio

#### Vercel/Netlify
- Upload da pasta dist/ ou arquivos HTML
- Configure redirects para SPA

#### VPS/Servidor
1. Upload dos arquivos
2. Configure Nginx/Apache
3. Execute scripts de instalação
4. Configure SSL

## Estrutura
```
deploy-sublimacalc/
├── index-modern.html      # Landing page
├── app.html              # Dashboard
├── backend-auth/         # API Backend
├── js/                   # Scripts
├── css/                  # Estilos
├── install.sh           # Script de instalação
├── start.sh             # Script de inicialização
└── README.md            # Este arquivo
```

## Suporte
Para dúvidas sobre deploy, consulte a documentação completa ou entre em contato.
"@

$deployReadme | Out-File -FilePath "$deployFolder/README.md" -Encoding UTF8

# Criar .gitignore para o deploy
$deployGitignore = @"
# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs
lib-cov

# Coverage directory
coverage

# Environment variables
.env
.env.local
.env.production

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Database
*.sqlite
*.db

# Uploads
uploads/
temp/

# OS
.DS_Store
Thumbs.db
"@

$deployGitignore | Out-File -FilePath "$deployFolder/.gitignore" -Encoding UTF8

Write-Host ""
Write-Host "📦 Criando arquivo ZIP..." -ForegroundColor Yellow

# Criar ZIP do deploy
$zipPath = "sublimacalc-deploy-$(Get-Date -Format 'yyyyMMdd-HHmm').zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

try {
    Compress-Archive -Path "$deployFolder/*" -DestinationPath $zipPath -CompressionLevel Optimal
    Write-Host "✓ ZIP criado: $zipPath" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao criar ZIP. Verifique manualmente a pasta $deployFolder" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Arquivos de deploy em: $deployFolder" -ForegroundColor Cyan
Write-Host "📦 Arquivo ZIP: $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure PostgreSQL no servidor" -ForegroundColor White
Write-Host "2. Configure Google OAuth" -ForegroundColor White
Write-Host "3. Upload dos arquivos para o servidor" -ForegroundColor White
Write-Host "4. Execute ./install.sh no servidor" -ForegroundColor White
Write-Host "5. Configure .env com credenciais reais" -ForegroundColor White
Write-Host "6. Execute ./start.sh" -ForegroundColor White
Write-Host ""

# Mostrar resumo dos arquivos
Write-Host "📄 Arquivos incluídos no deploy:" -ForegroundColor Cyan
Get-ChildItem $deployFolder -Recurse -Name | Sort-Object | ForEach-Object {
    Write-Host "   $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Deploy package pronto!" -ForegroundColor Green
