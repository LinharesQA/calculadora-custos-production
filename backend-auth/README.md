# SublimaCalc Backend - Sistema de Usuários

Backend completo para o sistema de usuários da SublimaCalc com autenticação Google OAuth, banco PostgreSQL e APIs RESTful.

## 🚀 Funcionalidades

### ✅ Autenticação & Segurança
- **Google OAuth 2.0**: Login com conta Google
- **JWT Tokens**: Autenticação segura
- **Rate Limiting**: Proteção contra ataques
- **Middleware de Segurança**: Helmet, CORS, Validações

### ✅ Privacidade & Isolamento
- **Dados Isolados**: Cada usuário vê apenas seus dados
- **Ownership Validation**: Verificação automática de propriedade
- **Soft Delete**: Dados não são perdidos permanentemente
- **Auditoria**: Logs de ações dos usuários

### ✅ APIs Completas
- **Usuários**: Perfil, configurações, export de dados
- **Moldes**: CRUD completo com validações
- **Bobinas**: CRUD completo com validações  
- **Projetos**: CRUD + cálculos de custos
- **Estatísticas**: Dashboard e analytics

### ✅ Banco de Dados
- **PostgreSQL**: Banco robusto e escalável
- **Sequelize ORM**: Migrações e relacionamentos
- **Índices Otimizados**: Performance garantida
- **JSONB**: Dados flexíveis para cálculos

## 📋 Pré-requisitos

1. **Node.js 16+**
2. **PostgreSQL 12+**
3. **Google Cloud Console** (para OAuth)

## 🛠️ Instalação

### 1. Instalar Dependências
```bash
cd backend-auth
npm install
```

### 2. Configurar Banco PostgreSQL

#### Opção A - PostgreSQL Local:
```bash
# Instalar PostgreSQL (Windows)
# Baixar: https://www.postgresql.org/download/windows/

# Criar banco
createdb sublimacalc
```

#### Opção B - PostgreSQL Docker:
```bash
docker run --name sublimacalc-postgres -e POSTGRES_DB=sublimacalc -e POSTGRES_PASSWORD=minhasenha -p 5432:5432 -d postgres:13
```

### 3. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a "Google+ API"
4. Vá em "Credenciais" → "Criar Credenciais" → "ID do cliente OAuth"
5. Configure:
   - **Tipo**: Aplicação web
   - **URIs de redirecionamento autorizados**: 
     - `http://localhost:3001/api/auth/google/callback`
     - `https://seu-dominio.com/api/auth/google/callback`

### 4. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
```

**Configurar `.env`:**
```bash
# Servidor
PORT=3001
NODE_ENV=development

# Banco PostgreSQL
DATABASE_URL=postgresql://postgres:minhasenha@localhost:5432/sublimacalc

# JWT Secret (gerar chave segura)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Setup do Banco
```bash
npm run setup
```

### 6. Iniciar Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🌐 Endpoints da API

### Autenticação
```
GET  /api/auth/google          - Iniciar login Google
GET  /api/auth/google/callback - Callback Google OAuth
GET  /api/auth/verify          - Verificar token JWT
POST /api/auth/logout          - Fazer logout
```

### Usuários
```
GET  /api/user/dashboard       - Dados do dashboard
GET  /api/user/profile         - Perfil do usuário
GET  /api/user/export          - Exportar todos os dados
PUT  /api/user/settings        - Atualizar configurações
```

### Moldes
```
GET    /api/molds              - Listar moldes
POST   /api/molds              - Criar molde
GET    /api/molds/:id          - Buscar molde
PUT    /api/molds/:id          - Atualizar molde
DELETE /api/molds/:id          - Deletar molde
GET    /api/molds/stats/overview - Estatísticas
```

### Bobinas
```
GET    /api/rolls              - Listar bobinas
POST   /api/rolls              - Criar bobina
GET    /api/rolls/:id          - Buscar bobina
PUT    /api/rolls/:id          - Atualizar bobina
DELETE /api/rolls/:id          - Deletar bobina
GET    /api/rolls/stats/overview - Estatísticas
```

### Projetos
```
GET    /api/projects           - Listar projetos
POST   /api/projects           - Criar projeto
GET    /api/projects/:id       - Buscar projeto
PUT    /api/projects/:id       - Atualizar projeto
DELETE /api/projects/:id       - Deletar projeto
POST   /api/projects/:id/calculate - Calcular custos
GET    /api/projects/stats/overview - Estatísticas
```

## 🔒 Segurança

### Autenticação
- **JWT Tokens**: Expiram em 24h
- **Google OAuth**: Autenticação confiável
- **Rate Limiting**: 100 requests/15min por IP

### Validação de Dados
- **Sanitização**: Inputs limpos automaticamente
- **Validação**: Tipos e ranges verificados
- **Ownership**: Usuário só acessa próprios dados

### Proteções
- **Helmet**: Headers de segurança
- **CORS**: Apenas origens autorizadas
- **SQL Injection**: Protegido pelo Sequelize
- **XSS**: Sanitização automática

## 📊 Banco de Dados

### Estrutura das Tabelas

#### Users
```sql
id          UUID PRIMARY KEY
google_id   VARCHAR UNIQUE
email       VARCHAR UNIQUE
name        VARCHAR
avatar      TEXT
provider    VARCHAR DEFAULT 'google'
is_active   BOOLEAN DEFAULT true
last_login  TIMESTAMP
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### Molds
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id)
name       VARCHAR
width      DECIMAL(10,2)
height     DECIMAL(10,2)
is_active  BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### Rolls
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id)
name       VARCHAR
width      DECIMAL(10,2)
is_active  BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### Projects
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
roll_id         UUID REFERENCES rolls(id)
name            VARCHAR
roll_price      DECIMAL(10,2)
roll_length     DECIMAL(10,2)
profit_margin   DECIMAL(5,2)
additional_cost DECIMAL(10,2)
total_cost      DECIMAL(10,2)
total_price     DECIMAL(10,2)
total_profit    DECIMAL(10,2)
items           JSONB
calculation_data JSONB
status          ENUM('draft','calculated','completed')
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## 🚀 Deploy

### EasyPanel Deploy
1. Criar serviço PostgreSQL no EasyPanel
2. Criar serviço Node.js apontando para este repo
3. Configurar variáveis de ambiente
4. Deploy automático

### Variáveis de Produção
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=chave_super_secreta_produção
GOOGLE_CLIENT_ID=seu_client_id_produção
GOOGLE_CLIENT_SECRET=seu_client_secret_produção
FRONTEND_URL=https://seu-dominio.com
```

## 🧪 Testes

### Health Check
```bash
curl http://localhost:3001/health
```

### Testar Autenticação
1. Acesse: `http://localhost:3001/api/auth/google`
2. Faça login com Google
3. Será redirecionado para o frontend com token

### Testar APIs (com token)
```bash
# Headers obrigatórios
Authorization: Bearer SEU_JWT_TOKEN
Content-Type: application/json

# Exemplo
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/api/user/profile
```

## 📈 Monitoramento

### Logs de Auditoria
```javascript
// Automaticamente logado no console (dev) ou arquivo (prod)
[AUDIT] 2024-01-15T10:30:00Z - User: uuid - Action: mold_create - IP: 192.168.1.1
```

### Métricas Disponíveis
- Número de usuários ativos
- Projetos criados por período
- Uso das APIs por endpoint
- Tempos de resposta

## 🆘 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Testar conexão manual
psql -h localhost -U postgres -d sublimacalc
```

### Erro de Autenticação Google
1. Verificar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
2. Confirmar URIs de redirecionamento no Google Console
3. Verificar se Google+ API está ativa

### Erro 401 Unauthorized
1. Verificar se token JWT está sendo enviado no header
2. Confirmar se token não expirou (24h)
3. Verificar `JWT_SECRET` no .env

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: linharesphillipe94@gmail.com
- **WhatsApp**: (98) 98451-8929

---

**Desenvolvido com ❤️ para SublimaCalc**
