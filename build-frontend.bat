@echo off
echo 🚀 Iniciando build do frontend...

REM Criar diretório de distribuição
if not exist "dist" mkdir dist

REM Copiar arquivos do frontend
if exist "frontend" (
    echo 📁 Copiando arquivos do frontend...
    xcopy "frontend\*" "dist\" /E /I /Y
    echo ✅ Arquivos copiados para dist/
) else (
    echo ❌ Pasta frontend não encontrada
    exit /b 1
)

REM Verificar se os arquivos foram copiados
if exist "dist\app.html" (
    echo ✅ Build do frontend concluído com sucesso!
    echo 📦 Arquivos prontos em dist/
    dir dist
) else (
    echo ❌ Erro: Arquivos HTML não encontrados em dist/
    exit /b 1
)
