# 🔧 PLANO DE REORGANIZAÇÃO - CALCULADORA DE CUSTOS

## 📋 PROBLEMAS IDENTIFICADOS

### 1. **ESTRUTURA CONFUSA**
- ❌ Múltiplos arquivos HTML com funcionalidades sobrepostas
- ❌ Pastas duplicadas e arquivos órfãos
- ❌ Configurações conflitantes

### 2. **CONFLITOS DE PORTA**
- ❌ Backend (3000) conflita com Vite (3000)
- ❌ Frontend-server (5173) sem propósito claro
- ❌ Múltiplos servidores rodando simultaneamente

### 3. **INTEGRAÇÕES QUEBRADAS**
- ❌ OAuth Google mal configurado
- ❌ Frontend não encontra backend
- ❌ Banco de dados inconsistente

## 🎯 NOVA ESTRUTURA PROPOSTA

```
calculadora-custos/
├── 📁 frontend/                 # Frontend React + Vite
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── 📁 backend/                  # Backend Express + Auth
│   ├── config/
│   ├── routes/
│   ├── models/
│   ├── data/
│   ├── package.json
│   └── server.js
│
├── 📁 docs/                     # Documentação
├── 📁 scripts/                  # Scripts de deploy/setup
├── 📄 package.json              # Scripts raiz
├── 📄 docker-compose.yml        # Ambiente local
└── 📄 README.md                 # Documentação principal
```

## 🔄 CONFIGURAÇÕES FIXAS

### **PORTAS DEFINIDAS:**
- 🎯 Frontend: `3000` (Vite)
- 🎯 Backend: `3001` (Express)
- 🎯 Database: SQLite local

### **ARQUIVOS A MANTER:**
- ✅ `src/` - Componentes React
- ✅ `backend-auth/` - Lógica de backend (renomear)
- ✅ `package.json` raiz

### **ARQUIVOS A REMOVER:**
- ❌ `app.html`, `app-backup.html`, `app-clean.html`
- ❌ `dashboard.html`, `login.html`
- ❌ `index-modern.html`, `react.html`
- ❌ `frontend-server.cjs`, `frontend-server.js`
- ❌ `simple-backend.cjs`, `test-*.js`
- ❌ Múltiplos arquivos de documentação duplicados

## 🚀 PLANO DE EXECUÇÃO

1. **FASE 1: LIMPEZA**
   - Remover arquivos duplicados
   - Consolidar documentação
   - Limpar dependências

2. **FASE 2: REORGANIZAÇÃO**
   - Mover backend para pasta `backend/`
   - Configurar frontend em `frontend/`
   - Ajustar portas e configurações

3. **FASE 3: INTEGRAÇÃO**
   - Conectar frontend-backend
   - Configurar banco de dados
   - Testar funcionalidades

4. **FASE 4: DEPLOY**
   - Scripts de build automatizado
   - Docker para desenvolvimento
   - Documentação atualizada

## ✅ RESULTADO ESPERADO

- 🎯 Um projeto limpo e organizado
- 🎯 Frontend React funcionando na porta 3000
- 🎯 Backend Express funcionando na porta 3001
- 🎯 Comunicação funcional entre front/back
- 🎯 Banco SQLite funcionando
- 🎯 Deploy local simplificado

## 🔧 COMANDOS PARA EXECUÇÃO LOCAL

```bash
# Instalar dependências
npm install

# Rodar backend (terminal 1)
npm run backend

# Rodar frontend (terminal 2)  
npm run frontend

# Rodar ambos simultaneamente
npm run dev

# Build para produção
npm run build
```
