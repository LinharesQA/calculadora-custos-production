# 🔧 APIs NECESSÁRIAS PARA SUBLIMACALC - GUIA VISUAL

## 📋 Lista das APIs para Ativar

### 1. **Google Identity and Access Management (IAM) API** ⚠️ OBRIGATÓRIA
- **Como encontrar:** Digite "identity" ou "iam" na busca
- **Uso:** Sistema de autenticação OAuth 2.0
- **Status:** Necessária para login com Google

### 2. **People API** ⚠️ OBRIGATÓRIA  
- **Como encontrar:** Digite "people" na busca
- **Uso:** Obter dados do perfil do usuário (nome, email, foto)
- **Status:** Substitui a antiga Google+ API

### 3. **Google+ API** 🔶 OPCIONAL (LEGACY)
- **Como encontrar:** Digite "google+" na busca
- **Uso:** API antiga para dados de perfil
- **Status:** Ainda funciona, mas People API é preferível

## 🚫 APIs que você NÃO precisa ativar:

❌ **Maps APIs** - Não usamos mapas
❌ **Cloud Vision API** - Não usamos reconhecimento de imagem  
❌ **Cloud Natural Language API** - Não usamos processamento de linguagem
❌ **Cloud Speech-to-Text API** - Não usamos reconhecimento de voz
❌ **Cloud Translation API** - Não usamos tradução
❌ **AI Platform APIs** - Não usamos machine learning do Google

## 📝 Passo a Passo:

1. **Na barra de pesquisa** (que aparece na sua imagem), digite:
   - `identity` → Ative a **Google Identity and Access Management API**
   - `people` → Ative a **People API**

2. **Após ativar**, vá em "Credenciais" para criar:
   - OAuth 2.0 Client ID
   - Client Secret

3. **Configure as URLs permitidas:**
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seu-dominio.com`

## ⚡ Resumo Rápido:
- ✅ **2 APIs apenas**: Identity + People
- ✅ **1 Credencial**: OAuth 2.0 Client
- ✅ **Total**: ~5 minutos para configurar

Todas as outras APIs que aparecem na sua tela são para outros tipos de aplicação!
