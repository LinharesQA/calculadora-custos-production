# 🧮 Calculadora de Custos - Sublimação (Reorganizada)

Uma aplicação fullstack completa para calcular custos, margens de lucro e gerar relatórios para negócios de sublimação.

## 🏗️ **ESTRUTURA REORGANIZADA**

```
calculadora-custos/
├── 📁 frontend/                 # Frontend React + Vite (Porta 3000)
│   ├── src/                     # Componentes React
│   ├── package.json             # Dependências do frontend
│   ├── vite.config.js           # Configuração Vite
│   └── index.html               # Página principal
│
├── 📁 backend/                  # Backend Express + Auth (Porta 3001)
│   ├── config/                  # Configurações (DB, Passport)
│   ├── routes/                  # Rotas da API
│   ├── models/                  # Modelos do banco
│   ├── data/                    # Banco SQLite
│   ├── package.json             # Dependências do backend
│   └── server.js                # Servidor principal
│
├── 📁 js/                       # Scripts compartilhados
├── 📄 package.json              # Scripts de gerenciamento
├── 📄 .env                      # Variáveis de ambiente
└── 📄 README.md                 # Esta documentação
```

## 🚀 **COMO EXECUTAR LOCALMENTE**

### **Método 1: Automático (Recomendado)**

```bash
# 1. Instalar dependências em todos os módulos
npm run install:all

# 2. Executar frontend + backend simultaneamente
npm run dev
```

### **Método 2: Manual (Para Debug)**

```bash
# Terminal 1 - Backend (Porta 3001)
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (Porta 3000)
cd frontend  
npm install
npm run dev
```

## 🎯 **PORTAS E ACESSOS**

- 🎯 **Frontend**: http://localhost:3000 (React + Vite)
- 🎯 **Backend API**: http://localhost:3001 (Express)
- 🎯 **Health Check**: http://localhost:3001/health

## ✨ **FUNCIONALIDADES**

- 📊 **Cálculo de Custos**: Materiais, mão de obra, equipamentos
- 💰 **Análise de Margem**: Controle preciso de lucro
- 📄 **Relatórios PDF**: Geração automática de orçamentos
- 💾 **Salvamento**: Dados persistidos no SQLite
- 📱 **Responsivo**: Funciona em desktop e mobile
- 🔐 **Autenticação**: Login com Google OAuth

## 🛠️ **TECNOLOGIAS**

### **Frontend**
- React 18 + Vite
- TailwindCSS
- Chart.js
- jsPDF

### **Backend**
- Node.js + Express
- SQLite / PostgreSQL
- Passport.js (OAuth)
- JWT Authentication

## 📦 **SCRIPTS DISPONÍVEIS**

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run frontend         # Apenas frontend
npm run backend          # Apenas backend

# Instalação
npm run install:all      # Instalar em todos os módulos
npm run setup           # Setup completo + banco

# Produção
npm run start           # Build + servir
npm run frontend:build  # Build do frontend

# Utilitários
npm run clean           # Limpar node_modules
```

## 🗄️ **BANCO DE DADOS**

### **Desenvolvimento Local**
- **SQLite** automático em `backend/data/sublimacalc.sqlite`
- **Auto-setup** na primeira execução

### **Comandos do Banco**
```bash
cd backend
npm run setup-db        # Criar tabelas
npm run db:backup        # Backup do banco
npm run db:reset         # Reset completo
npm run db:status        # Verificar conexão
```

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente (.env)**
```env
NODE_ENV=development
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=./data/sublimacalc.sqlite

# OAuth Google (opcional)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
JWT_SECRET=sua_chave_jwt
```

## 🚚 **DEPLOY**

### **EasyPanel / VPS**
```bash
# Build para produção
npm run frontend:build

# Subir arquivos da pasta frontend/dist
# Backend pode usar PM2 ou similar
```

### **Docker (Futuro)**
```bash
docker-compose up -d
```

## 🐛 **TROUBLESHOOTING**

### **Problemas Comuns**

1. **Erro de porta ocupada**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /f /pid NUMERO_PID
   ```

2. **Dependências não instaladas**
   ```bash
   npm run clean
   npm run install:all
   ```

3. **Banco corrompido**
   ```bash
   cd backend
   npm run db:reset
   ```

4. **CORS Error**
   - Verificar se backend está na porta 3001
   - Verificar configuração no vite.config.js

## 📞 **SUPORTE**

- 🐛 Issues: Criar issue no repositório
- 📧 Contato: phillipe77 (GitHub)
- 📖 Docs: Consultar arquivos na pasta raiz

---

## ✅ **STATUS DO PROJETO**

- ✅ Estrutura reorganizada
- ✅ Frontend React funcional
- ✅ Backend Express funcional  
- ✅ Comunicação Frontend-Backend
- ✅ Banco SQLite configurado
- ⏳ OAuth Google (em configuração)
- ⏳ Deploy automatizado
- ⏳ Testes unitários
