# Script para criar ZIP de deploy
Write-Host "Criando arquivo ZIP para deploy no EasyPanel..." -ForegroundColor Cyan

# Nome do arquivo ZIP
$zipName = "calculadora-custos-deploy.zip"

# Remover ZIP anterior se existir
if (Test-Path $zipName) {
    Remove-Item $zipName
    Write-Host "Removido ZIP anterior" -ForegroundColor Yellow
}

# Arquivos e pastas a incluir
$itemsToInclude = @(
    "package.json",
    "vite.config.js", 
    "easypanel.json",
    "index.html",
    "postcss.config.js",
    "tailwind.config.js",
    "src",
    "backend",
    "README.md"
)

# Criar pasta temporaria
$tempFolder = "temp-deploy"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder

Write-Host "Copiando arquivos necessarios..." -ForegroundColor Yellow

# Copiar cada item
foreach ($item in $itemsToInclude) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            Copy-Item $item -Destination $tempFolder -Recurse
            Write-Host "Copiado: $item/ (pasta)" -ForegroundColor Green
        } else {
            Copy-Item $item -Destination $tempFolder
            Write-Host "Copiado: $item" -ForegroundColor Green
        }
    } else {
        Write-Host "Nao encontrado: $item" -ForegroundColor Yellow
    }
}

# Criar o ZIP
Write-Host "Compactando arquivos..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipName -Force

# Limpar pasta temporaria
Remove-Item $tempFolder -Recurse -Force

# Mostrar resultado
if (Test-Path $zipName) {
    $zipSize = (Get-Item $zipName).Length / 1MB
    Write-Host "ZIP criado com sucesso!" -ForegroundColor Green
    Write-Host "Arquivo: $zipName" -ForegroundColor Cyan
    Write-Host "Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Arraste o arquivo para a area de upload do EasyPanel"
    Write-Host "2. Aguarde o upload completar"
    Write-Host "3. Configure as settings de build"
    Write-Host "4. Clique em Deploy"
    Write-Host ""
} else {
    Write-Host "Erro ao criar ZIP!" -ForegroundColor Red
}
