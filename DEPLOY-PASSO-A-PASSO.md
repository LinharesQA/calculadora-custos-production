# 🚀 GUIA PASSO A PASSO - Deploy EasyPanel

## 📍 **PASSO 1: PREPARAR GITHUB**

### 1.1 Verificar se Git está inicializado:
```bash
cd "c:\Projetos Desenv\visualizaai-main\calculadora-custos"
git status
```

### 1.2 Se não estiver, inicializar:
```bash
git init
git branch -M main
```

### 1.3 Adicionar arquivos (SEM dados sensíveis):
```bash
git add .
git commit -m "feat: sistema completo com auth, backend e frontend moderno"
```

### 1.4 Conectar ao GitHub:
```bash
# Substituir 'phillipe77' pelo seu usuário
git remote add origin https://github.com/phillipe77/calculadora-custos.git
git push -u origin main
```

---

## 📍 **PASSO 2: CONFIGURAR POSTGRESQL NO EASYPANEL**

### 2.1 No painel EasyPanel:
- [ ] **Services** → **Create Service**
- [ ] **Database** → **PostgreSQL**
- [ ] Nome: `calculadora-db`
- [ ] Version: `15` (ou mais recente)

### 2.2 Após criação:
- [ ] **Copiar** `DATABASE_URL` das configurações
- [ ] **Anotar** para usar nas variáveis de ambiente

**Exemplo de DATABASE_URL:**
```
postgresql://postgres:senha123@calculadora-db:5432/postgres
```

---

## 📍 **PASSO 3: CONFIGURAR BACKEND (NODE.JS SERVICE)**

### 3.1 Criar serviço backend:
- [ ] **Services** → **Create Service**
- [ ] **Node.js Service**
- [ ] Nome: `calculadora-api`

### 3.2 Configurações do Source:
- [ ] **Source Type**: `GitHub`
- [ ] **Repository**: `phillipe77/calculadora-custos`
- [ ] **Branch**: `main`
- [ ] **Build Path**: `/` (raiz)

### 3.3 Configurações de Build:
- [ ] **Install Command**: `npm install && cd backend-auth && npm install`
- [ ] **Start Command**: `cd backend-auth && npm start`
- [ ] **Port**: `3000`
- [ ] **Health Check**: `/api/health`

### 3.4 Environment Variables:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=[COLAR_URL_DO_POSTGRESQL]
JWT_SECRET=[GERAR_COM_generate-jwt-secret.js]
FRONTEND_URL=https://[NOME-FRONTEND].easypanel.app
GOOGLE_CLIENT_ID=[SEU_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[SEU_GOOGLE_CLIENT_SECRET]
```

### 3.5 Deploy backend:
- [ ] **Save & Deploy**
- [ ] **Aguardar build** (pode demorar alguns minutos)
- [ ] **Verificar health check**: `https://calculadora-api.easypanel.app/api/health`

---

## 📍 **PASSO 4: CONFIGURAR FRONTEND (STATIC SITE)**

### 4.1 Criar serviço frontend:
- [ ] **Services** → **Create Service** 
- [ ] **Static Site**
- [ ] Nome: `calculadora-frontend`

### 4.2 Configurações do Source:
- [ ] **Source Type**: `GitHub`
- [ ] **Repository**: `phillipe77/calculadora-custos`
- [ ] **Branch**: `main`
- [ ] **Build Path**: `/` (raiz)

### 4.3 Configurações de Build:
- [ ] **Framework**: `Other`
- [ ] **Install Command**: `npm install`
- [ ] **Build Command**: `echo "Frontend ready"`
- [ ] **Output Directory**: `./` (raiz)

### 4.4 Deploy frontend:
- [ ] **Save & Deploy**
- [ ] **Aguardar build**
- [ ] **Testar acesso**: `https://calculadora-frontend.easypanel.app`

---

## 📍 **PASSO 5: CONFIGURAR GOOGLE OAUTH**

### 5.1 Anotar URLs finais:
- [ ] Frontend: `https://calculadora-frontend.easypanel.app`
- [ ] Backend: `https://calculadora-api.easypanel.app`

### 5.2 Atualizar Google Console:
- [ ] Ir em: https://console.developers.google.com/
- [ ] **Credenciais** → **OAuth 2.0 Client IDs**
- [ ] **Origens JavaScript autorizadas** - Adicionar:
  - `https://calculadora-frontend.easypanel.app`
  - `https://calculadora-api.easypanel.app`
- [ ] **URIs de redirecionamento** - Adicionar:
  - `https://calculadora-api.easypanel.app/api/auth/google/callback`

### 5.3 Atualizar variável do backend:
```env
FRONTEND_URL=https://calculadora-frontend.easypanel.app
```

---

## 📍 **PASSO 6: TESTE FINAL**

### 6.1 Health checks:
- [ ] Backend: `GET https://calculadora-api.easypanel.app/api/health`
- [ ] Database: `GET https://calculadora-api.easypanel.app/api/health/db`

### 6.2 Funcionalidades:
- [ ] Frontend carrega
- [ ] Login com Google funciona
- [ ] Dashboard exibe dados
- [ ] Cálculos funcionam
- [ ] Projetos salvam

### 6.3 Se algo não funcionar:
- [ ] Verificar logs no EasyPanel
- [ ] Verificar variáveis de ambiente
- [ ] Verificar URLs do Google OAuth

---

## ✅ **SISTEMA EM PRODUÇÃO!**

Quando todos os passos estiverem concluídos, seu sistema estará 100% funcional em produção!

**URLs finais:**
- 🌐 **Frontend**: `https://calculadora-frontend.easypanel.app`
- 🔗 **API**: `https://calculadora-api.easypanel.app`
- 🗄️ **Database**: PostgreSQL interno

---

## 🔥 **PRONTO PARA COMEÇAR?**

**Vamos fazer PASSO 1 agora:**

1. Abra terminal na pasta do projeto
2. Execute os comandos Git do Passo 1
3. Confirme que subiu para GitHub
4. Me avise quando estiver pronto para Passo 2!

**Vamos nessa! 🚀**
