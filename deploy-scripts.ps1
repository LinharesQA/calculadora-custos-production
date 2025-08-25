# Scripts para Deploy - Calculadora de Custos
# Execute no PowerShell no diretório do projeto

Write-Host "🚀 Scripts de Deploy - Calculadora de Custos" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

function Install-Dependencies {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
}

function Build-Project {
    Write-Host "🔨 Fazendo build do projeto..." -ForegroundColor Yellow
    npm run build
    Write-Host "✅ Build concluído! Pasta 'dist' criada." -ForegroundColor Green
}

function Preview-Local {
    Write-Host "👀 Iniciando preview local..." -ForegroundColor Yellow
    Write-Host "📝 Acesse: http://localhost:3001" -ForegroundColor Cyan
    npm run preview
}

function Test-Build {
    Write-Host "🧪 Testando build completo..." -ForegroundColor Yellow
    Install-Dependencies
    Build-Project
    Write-Host "✅ Projeto pronto para deploy!" -ForegroundColor Green
    Write-Host "📁 Arquivos de deploy estão na pasta 'dist/'" -ForegroundColor Cyan
}

function Show-Info {
    Write-Host ""
    Write-Host "📋 INFORMAÇÕES DO PROJETO" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host "Nome: calculadora-custos-sublimacao"
    Write-Host "Framework: Vite + React"
    Write-Host "Build Command: npm run build"
    Write-Host "Output Directory: dist"
    Write-Host "Install Command: npm install"
    Write-Host "Node Version: 18"
    Write-Host ""
    Write-Host "📦 ARQUIVOS IMPORTANTES:" -ForegroundColor Yellow
    Write-Host "- package.json (dependências)"
    Write-Host "- easypanel.json (config EasyPanel)"
    Write-Host "- vite.config.js (config Vite)"
    Write-Host "- src/ (código fonte)"
    Write-Host "- dist/ (build final - criado automaticamente)"
    Write-Host ""
}

# Menu interativo
Write-Host ""
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host "1. Instalar dependências"
Write-Host "2. Fazer build"
Write-Host "3. Preview local"
Write-Host "4. Teste completo (install + build)"
Write-Host "5. Mostrar informações"
Write-Host "0. Sair"
Write-Host ""

$choice = Read-Host "Digite sua escolha (0-5)"

switch ($choice) {
    "1" { Install-Dependencies }
    "2" { Build-Project }
    "3" { Preview-Local }
    "4" { Test-Build }
    "5" { Show-Info }
    "0" { Write-Host "👋 Até logo!" -ForegroundColor Green }
    default { Write-Host "❌ Opção inválida!" -ForegroundColor Red }
}
