# SublimaCalc - Sistema Completo de Cálculo de Custos

## 📋 Visão Geral

O **SublimaCalc** é um sistema completo para cálculo de custos de sublimação, com interface moderna, autenticação via Google OAuth e backend robusto para gerenciamento multi-usuário.

### 🚀 Funcionalidades Principais

#### Frontend
- **Landing Page Moderna**: Design glassmorphismo, animações fluidas
- **Dashboard Completo**: Gerenciamento de moldes, bobinas e projetos
- **Calculadora Avançada**: Cálculo preciso de custos com margem de lucro
- **Analytics**: Gráficos e estatísticas de uso
- **Responsivo**: Funciona em desktop, tablet e mobile

#### Backend
- **Autenticação Google OAuth**: Login seguro e simples
- **API RESTful**: Endpoints completos para todas as operações
- **Banco PostgreSQL**: Persistência robusta com relacionamentos
- **Segurança**: JWT, rate limiting, validação de dados
- **Multi-usuário**: Isolamento completo de dados por usuário

## 🏗️ Arquitetura do Sistema

### Frontend (Client-side)
```
index-modern.html       # Landing page com login
app.html               # Dashboard principal
js/api-client.js       # Cliente API com autenticação
css/                   # Estilos e animações
```

### Backend (Server-side)
```
backend-auth/
├── server.js          # Servidor Express principal
├── config/            # Configurações (DB, OAuth)
├── models/            # Modelos de dados (User, Mold, Roll, Project)
├── routes/            # Rotas da API
├── middleware/        # Middlewares de segurança
└── .env              # Variáveis de ambiente
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- Conta Google Cloud (para OAuth)

### 1. Instalação Automática
```powershell
# Execute o script de setup
.\setup-backend.ps1
```

### 2. Instalação Manual

#### Backend
```bash
cd backend-auth
npm install
```

#### Configurar Banco de Dados
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco
CREATE DATABASE sublimacalc;
```

#### Configurar Variáveis de Ambiente
```bash
# Copie .env.example para .env e configure:
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:senha@localhost:5432/sublimacalc
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sublimacalc
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione existente
3. Habilite a "Google Sign-In API"
4. Configure as credenciais OAuth:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
5. Copie Client ID e Client Secret para o `.env`

### 4. Inicializar Banco de Dados
```bash
cd backend-auth
npm run setup-db
```

### 5. Iniciar Aplicação
```bash
# Backend
cd backend-auth
npm start

# Frontend (nova janela do terminal)
npm run dev
```

## 📊 Modelos de Dados

### User (Usuário)
```javascript
{
  id: UUID,
  googleId: String,
  email: String,
  name: String,
  picture: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Mold (Molde)
```javascript
{
  id: UUID,
  userId: UUID,
  name: String,
  width: Float,      // cm
  height: Float,     // cm
  area: Float,       // cm² (calculado)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Roll (Bobina)
```javascript
{
  id: UUID,
  userId: UUID,
  name: String,
  width: Float,      // cm
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Project (Projeto)
```javascript
{
  id: UUID,
  userId: UUID,
  name: String,
  rollId: UUID,
  rollPrice: Float,
  rollLength: Float,
  profitMargin: Float,
  additionalCost: Float,
  totalCost: Float,
  totalPrice: Float,
  totalProfit: Float,
  status: Enum('draft', 'calculated', 'completed'),
  items: JSONB,      // Array de itens do projeto
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 🔐 API Endpoints

### Autenticação
```
GET  /auth/google              # Iniciar login Google
GET  /auth/google/callback     # Callback OAuth
POST /auth/logout              # Logout
GET  /auth/me                  # Info do usuário atual
```

### Dashboard
```
GET  /api/dashboard            # Estatísticas gerais
```

### Moldes
```
GET    /api/molds              # Listar moldes
POST   /api/molds              # Criar molde
GET    /api/molds/:id          # Obter molde
PUT    /api/molds/:id          # Atualizar molde
DELETE /api/molds/:id          # Excluir molde
```

### Bobinas
```
GET    /api/rolls              # Listar bobinas
POST   /api/rolls              # Criar bobina
GET    /api/rolls/:id          # Obter bobina
PUT    /api/rolls/:id          # Atualizar bobina
DELETE /api/rolls/:id          # Excluir bobina
```

### Projetos
```
GET    /api/projects           # Listar projetos
POST   /api/projects           # Criar projeto
GET    /api/projects/:id       # Obter projeto
PUT    /api/projects/:id       # Atualizar projeto
DELETE /api/projects/:id       # Excluir projeto
POST   /api/projects/:id/calculate  # Calcular custos
```

### Dados
```
GET    /api/export             # Exportar todos os dados
POST   /api/import             # Importar dados
```

## 🔒 Segurança

### Autenticação
- **Google OAuth 2.0**: Login seguro sem armazenar senhas
- **JWT Tokens**: Sessões stateless com expiração
- **Middleware de Autenticação**: Proteção de todas as rotas

### Autorização
- **Isolamento por Usuário**: Cada usuário vê apenas seus dados
- **Validação de Propriedade**: Verificação antes de qualquer operação
- **Rate Limiting**: Proteção contra abuso da API

### Dados
- **Validação de Input**: Sanitização e validação rigorosa
- **Prepared Statements**: Proteção contra SQL Injection
- **Hashing Seguro**: Bcrypt para dados sensíveis
- **HTTPS**: Comunicação criptografada

## 🚀 Deploy

### 1. Deploy Automatizado
```powershell
# Gera pacote completo de deploy
.\deploy-complete.ps1
```

### 2. Deploy Manual

#### Preparação
```bash
# Build do frontend
npm run build

# Instalar dependências de produção
cd backend-auth
npm ci --only=production
```

#### Variáveis de Ambiente (Produção)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://seudominio.com
GOOGLE_CLIENT_ID=seu_client_id_producao
GOOGLE_CLIENT_SECRET=seu_client_secret_producao
JWT_SECRET=jwt_secret_super_forte_producao
```

#### Serviços Recomendados

**EasyPanel** (Recomendado)
1. Upload do projeto
2. Configure variáveis de ambiente
3. Deploy automático

**Vercel + Railway**
- Frontend: Vercel
- Backend + DB: Railway

**VPS**
- Nginx + PM2 + PostgreSQL
- SSL com Let's Encrypt

### 3. Docker (Opcional)
```dockerfile
# Dockerfile já incluído no projeto
docker build -t sublimacalc .
docker run -p 3000:3000 sublimacalc
```

## 📱 Uso da Aplicação

### 1. Acesso
1. Acesse a landing page
2. Clique em "Entrar com Google"
3. Autorize a aplicação

### 2. Configuração Inicial
1. **Aba Moldes**: Cadastre seus moldes com dimensões
2. **Aba Bobinas**: Cadastre suas bobinas com larguras
3. **Aba Cálculo**: Comece a criar projetos

### 3. Criando um Projeto
1. Nomeie o projeto
2. Selecione a bobina e defina preço/comprimento
3. Adicione moldes ao planejamento
4. Configure margem de lucro
5. Calcule e salve

### 4. Análise
- **Dashboard**: Visão geral das estatísticas
- **Analytics**: Gráficos de evolução
- **Projetos**: Histórico completo de cálculos

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar logs
tail -f backend-auth/logs/app.log
```

**Google OAuth não funciona**
1. Verificar URLs de callback
2. Confirmar Client ID/Secret
3. Verificar domínios autorizados

**Frontend não carrega dados**
1. Verificar se backend está rodando
2. Conferir CORS nas configurações
3. Verificar console do navegador

### Logs
```bash
# Backend logs
tail -f backend-auth/logs/app.log

# Banco de dados logs
tail -f /var/log/postgresql/postgresql-*.log
```

## 📈 Performance

### Otimizações Implementadas
- **Lazy Loading**: Componentes carregados sob demanda
- **Debouncing**: Busca e filtros otimizados
- **Caching**: Headers de cache adequados
- **Compressão**: Gzip habilitado
- **Indexação**: Índices otimizados no banco

### Monitoramento
- Rate limiting por IP
- Logs estruturados
- Métricas de uso
- Alertas de erro

## 🔄 Atualizações

### Versionamento
- **Frontend**: Versionamento semântico
- **Backend**: Migrations de banco automáticas
- **API**: Versionamento por header

### Deploy de Atualizações
```bash
# Backup do banco
pg_dump sublimacalc > backup.sql

# Deploy da nova versão
git pull origin main
npm run build
pm2 restart sublimacalc
```

## 🆘 Suporte

### Contato
- **Email**: seu-email@dominio.com
- **GitHub**: https://github.com/seu-usuario/sublimacalc

### Contribuição
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**SublimaCalc** - Sistema profissional para cálculo de custos de sublimação com tecnologia moderna e interface intuitiva.
