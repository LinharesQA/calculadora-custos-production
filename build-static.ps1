# Script para build local e ZIP estatico
Write-Host "Fazendo build local para deploy estatico..." -ForegroundColor Cyan

# Fazer build
Write-Host "1. Fazendo build da aplicacao..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "ERRO no build!" -ForegroundColor Red
    exit
}

# Criar ZIP apenas com arquivos buildados
$zipName = "calculadora-custos-static.zip"
Write-Host "2. Criando ZIP dos arquivos estaticos..." -ForegroundColor Yellow

# Remover ZIP anterior
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Verificar se pasta dist existe
if (-not (Test-Path "dist")) {
    Write-Host "ERRO: Pasta 'dist' nao encontrada!" -ForegroundColor Red
    exit
}

# Criar ZIP apenas com conteudo da pasta dist
Compress-Archive -Path "dist\*" -DestinationPath $zipName -Force

if (Test-Path $zipName) {
    $zipSize = (Get-Item $zipName).Length / 1MB
    Write-Host "ZIP estatico criado com sucesso!" -ForegroundColor Green
    Write-Host "Arquivo: $zipName" -ForegroundColor Cyan
    Write-Host "Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "COMO USAR NO EASYPANEL:" -ForegroundColor Yellow
    Write-Host "1. Delete o servico atual (se necessario)"
    Write-Host "2. Crie novo servico como 'Static Site'"
    Write-Host "3. Faca upload do arquivo '$zipName'"
    Write-Host "4. Configure:"
    Write-Host "   - Build Command: (deixe vazio)"
    Write-Host "   - Install Command: (deixe vazio)"
    Write-Host "   - Output Directory: ./ ou root"
    Write-Host "   - Framework: HTML/Static"
    Write-Host "5. Deploy!"
    Write-Host ""
} else {
    Write-Host "ERRO ao criar ZIP!" -ForegroundColor Red
}

# Mostrar conteudo da pasta dist
Write-Host "Conteudo da pasta dist:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" -Recurse | Select-Object Name, Length
