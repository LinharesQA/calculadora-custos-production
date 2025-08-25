# Script para configurar GitHub e deploy
Write-Host "Configurando GitHub para deploy automatico..." -ForegroundColor Cyan

# Verificar se git esta instalado
try {
    git --version
    Write-Host "Git encontrado!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Git nao encontrado. Instale o Git primeiro." -ForegroundColor Red
    Write-Host "Download: https://git-scm.com/download/windows" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "PASSOS PARA CONFIGURAR GITHUB:" -ForegroundColor Yellow
Write-Host "1. Crie um repositorio no GitHub (https://github.com/new)"
Write-Host "2. Nome sugerido: calculadora-custos"
Write-Host "3. Deixe como publico ou privado"
Write-Host "4. NAO inicialize com README (ja temos um)"
Write-Host ""

# Inicializar repositorio
Write-Host "Inicializando repositorio local..." -ForegroundColor Yellow
git init

# Adicionar arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Commit inicial
Write-Host "Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "feat: calculadora de custos para sublimacao - versao inicial"

Write-Host ""
Write-Host "PROXIMOS COMANDOS (execute apos criar repo no GitHub):" -ForegroundColor Cyan
Write-Host "git remote add origin https://github.com/SEU-USUARIO/calculadora-custos.git"
Write-Host "git branch -M main"
Write-Host "git push -u origin main"
Write-Host ""

Write-Host "DEPOIS NO EASYPANEL:" -ForegroundColor Yellow
Write-Host "1. Na tela de Source, clique em 'Github'"
Write-Host "2. Conecte sua conta GitHub"
Write-Host "3. Selecione o repositorio 'calculadora-custos'"
Write-Host "4. Branch: main"
Write-Host "5. Deploy automatico ativado!"
Write-Host ""
