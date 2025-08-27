#!/bin/bash
# Build script para frontend estático

echo "🚀 Iniciando build do frontend..."

# Criar diretório de distribuição
mkdir -p dist

# Copiar arquivos do frontend
if [ -d "frontend" ]; then
    echo "📁 Copiando arquivos do frontend..."
    cp -r frontend/* dist/
    echo "✅ Arquivos copiados para dist/"
else
    echo "❌ Pasta frontend não encontrada"
    exit 1
fi

# Verificar se os arquivos foram copiados
if [ -f "dist/app.html" ] || [ -f "dist/index.html" ]; then
    echo "✅ Build do frontend concluído com sucesso!"
    echo "📦 Arquivos prontos em dist/"
    ls -la dist/
else
    echo "❌ Erro: Arquivos HTML não encontrados em dist/"
    exit 1
fi
