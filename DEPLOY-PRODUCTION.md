# Configuração para Produção no EasyPanel 🚀

## Visão Geral
Este sistema agora é completo com:
- ✅ Frontend moderno (React/JS)
- ✅ Backend com autenticação (Express + JWT + OAuth Google)
- ✅ Sistema de usuários
- ✅ Banco de dados (SQLite local → PostgreSQL produção)
- ✅ Login/Logout/Registro
- ✅ Dashboard com persistência de dados

## Arquitectura de Produção

```
Frontend (EasyPanel App) → Backend (EasyPanel Service) → PostgreSQL (EasyPanel Database)
        ↓                         ↓                           ↓
    Servir arquivos          APIs + Autenticação        Dados dos usuários
    estáticos (HTML/CSS/JS)      JWT + Google OAuth         Projetos salvos
```

## 1. Configuração do Banco de Dados

### PostgreSQL no EasyPanel
- ✅ Suporte nativo ao PostgreSQL
- ✅ Configuração automática de variáveis de ambiente
- ✅ Sistema já preparado para migração SQLite → PostgreSQL

### Variáveis de Ambiente Necessárias
```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
# ou separadamente:
DB_HOST=postgres_host
DB_PORT=5432
DB_NAME=sublimacalc_prod
DB_USER=sublimacalc_user
DB_PASSWORD=senha_segura

# JWT
JWT_SECRET=chave_super_secreta_producao_256_bits

# Google OAuth (se mantiver)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_secret

# Ambiente
NODE_ENV=production
PORT=3000

# CORS (Frontend URL)
FRONTEND_URL=https://seu-dominio.com
```

## 2. Configuração dos Serviços

### Frontend (App Estática)
- Tipo: **Static Site**
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite/HTML

### Backend (API Service)  
- Tipo: **Node.js Service**
- Start Command: `npm start`
- Port: 3000
- Health Check: `/api/health`

## 3. Scripts de Deploy

### 3.1 Preparação do Banco
```bash
# Executar uma vez na primeira configuração
npm run backend:setup-db
```

### 3.2 Build de Produção
```bash
# Frontend build
npm run build

# Backend start
cd backend-auth && npm start
```

## 4. Checklist de Deploy

### Pré-Deploy
- [ ] Configurar banco PostgreSQL no EasyPanel
- [ ] Adicionar variáveis de ambiente
- [ ] Testar conexão local com PostgreSQL
- [ ] Fazer backup dos dados SQLite (se necessário)

### Deploy
- [ ] Push código para repositório Git
- [ ] Conectar repositório ao EasyPanel
- [ ] Configurar dois serviços (Frontend + Backend)
- [ ] Executar migrations do banco
- [ ] Testar autenticação
- [ ] Verificar CORS e domínios

### Pós-Deploy
- [ ] Testar fluxo completo de usuário
- [ ] Verificar logs de erro
- [ ] Configurar monitoramento
- [ ] Configurar backups automáticos

## 5. Configurações de Segurança

### Headers de Segurança (já configurados)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY  
- X-XSS-Protection: 1; mode=block
- CORS restrito ao domínio

### SSL/HTTPS
- EasyPanel fornece SSL automático
- Redirecionar HTTP → HTTPS
- Atualizar URLs de OAuth para HTTPS

## 6. Migração de Dados

Se você tem dados no SQLite local que quer manter:

```bash
# 1. Exportar dados SQLite
node backend-auth/scripts/export-data.js

# 2. Importar para PostgreSQL (após deploy)
node backend-auth/scripts/import-data.js
```

## 7. Monitoramento

### Logs Importantes
```bash
# Logs do backend
tail -f backend-auth/logs/app.log

# Status do banco
npm run db:status
```

### Health Checks
- Frontend: `GET /`
- Backend: `GET /api/health`
- Database: `GET /api/health/db`

## 8. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Produção local (teste)
NODE_ENV=production npm start

# Reset banco (cuidado!)
npm run db:reset

# Backup banco
npm run db:backup
```

## Próximos Passos
1. 🗄️ Configurar PostgreSQL no EasyPanel
2. 🔧 Atualizar easypanel.json para dois serviços
3. 🌐 Configurar variáveis de ambiente
4. 🚀 Deploy e testes

Quer que eu ajude com algum passo específico? 🤔
