# 🚀 DEPLOY CHECKLIST COMPLETO - EasyPanel

## Pré-requisitos Concluídos ✅
- ✅ Sistema completo com frontend + backend + auth
- ✅ Banco de dados configurado (SQLite → PostgreSQL)
- ✅ Sistema de usuários com JWT + Google OAuth
- ✅ Dashboard funcional com persistência
- ✅ Arquivos de configuração atualizados

---

## 1. 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS

### No EasyPanel:
- [ ] Criar serviço PostgreSQL
- [ ] Anotar dados de conexão:
  - Host: `_______`
  - Porta: `5432` (padrão)
  - Database: `_______`
  - Usuário: `_______`
  - Senha: `_______`
- [ ] Copiar `DATABASE_URL` completa

### Formato da DATABASE_URL:
```
postgresql://usuario:senha@host:5432/database
```

---

## 2. 🔧 VARIÁVEIS DE AMBIENTE

### Obrigatórias:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:senha@host:5432/database
JWT_SECRET=[GERAR COM: node generate-jwt-secret.js]
FRONTEND_URL=https://[SEU-DOMINIO-FRONTEND]
```

### Opcionais (Google OAuth):
```env
GOOGLE_CLIENT_ID=[SEU_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[SEU_GOOGLE_SECRET]
```

### Configurações de Segurança:
```env
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## 3. 🚀 CONFIGURAÇÃO DOS SERVIÇOS

### 3.1 Frontend (Static Site)
- [ ] Tipo: **Static Site**
- [ ] Repositório: Conectar seu repo Git
- [ ] Branch: `main`
- [ ] Build Command: `npm run build:frontend`
- [ ] Output Directory: `./` (raiz, arquivos HTML)
- [ ] Node Version: `18`

### 3.2 Backend (Node.js Service)
- [ ] Tipo: **Node.js Service**
- [ ] Repositório: Mesmo repo Git
- [ ] Branch: `main`
- [ ] Start Command: `npm run start:production`
- [ ] Install Command: `npm install && cd backend-auth && npm install`
- [ ] Port: `3000`
- [ ] Health Check: `/api/health`
- [ ] Node Version: `18`

---

## 4. 🔑 CONFIGURAÇÃO GOOGLE OAUTH (CRÍTICO!)

### 4.1 Anotar URLs do EasyPanel:
- [ ] Frontend: `https://sua-calculadora.easypanel.app`
- [ ] Backend: `https://sua-calculadora-api.easypanel.app`

### 4.2 Atualizar Google Console:
- [ ] Acessar: https://console.developers.google.com/
- [ ] Ir em "Credenciais" > Seu OAuth Client
- [ ] **Origens JavaScript autorizadas** - ADICIONAR:
  - [ ] `https://sua-calculadora.easypanel.app`
  - [ ] `https://sua-calculadora-api.easypanel.app`
- [ ] **URIs de redirecionamento** - ADICIONAR:
  - [ ] `https://sua-calculadora-api.easypanel.app/api/auth/google/callback`
  - [ ] `https://sua-calculadora.easypanel.app/login`

### 4.3 Atualizar Variáveis de Ambiente:
- [ ] `FRONTEND_URL=https://sua-calculadora.easypanel.app`
- [ ] `GOOGLE_REDIRECT_URL=https://sua-calculadora-api.easypanel.app/api/auth/google/callback`

⚠️ **SEM ESTA CONFIGURAÇÃO O OAUTH NÃO FUNCIONARÁ!**

---

## 5. ⚙️ CONFIGURAÇÃO DE REDE

### CORS:
- [ ] Frontend URL configurada no backend
- [ ] Backend URL configurada no frontend (se necessário)

### Domínios:
- [ ] Frontend: `https://sua-calculadora.easypanel.app`
- [ ] Backend: `https://sua-calculadora-api.easypanel.app`

---

## 6. 📦 DEPLOY

### 5.1 Preparação Local:
```bash
# 1. Gerar JWT Secret
node generate-jwt-secret.js

# 2. Verificar configuração
node setup-production.js

# 3. Testar localmente com PostgreSQL (opcional)
export DATABASE_URL="postgresql://..."
npm run start:production
```

### 5.2 Git Push:
```bash
git add .
git commit -m "feat: sistema completo pronto para produção"
git push origin main
```

### 6.3 EasyPanel:
- [ ] Conectar repositório
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy do backend primeiro
- [ ] Fazer deploy do frontend
- [ ] Executar migration do banco

### 6.4 Configurar Google OAuth (APÓS URLs DEFINIDAS):
- [ ] Atualizar Google Console com URLs de produção
- [ ] Testar login com Google
- [ ] Verificar redirecionamento funciona

---

## 7. 🧪 TESTES PÓS-DEPLOY

### Health Checks:
- [ ] `GET /api/health` → Status: 200 OK
- [ ] `GET /api/health/db` → Database: Connected

### Google OAuth (CRÍTICO):
- [ ] Clicar "Login com Google" funciona
- [ ] Popup Google abre corretamente  
- [ ] Autorização completa sem erros
- [ ] Redirecionamento volta para dashboard
- [ ] JWT token é gerado e salvo
- [ ] Dashboard carrega dados do usuário

### Funcionalidades:
- [ ] Página inicial carrega
- [ ] Registro de usuário funciona
- [ ] Login com JWT funciona
- [ ] Google OAuth funciona (se configurado)
- [ ] Dashboard carrega dados
- [ ] Cálculos funcionam
- [ ] Projetos são salvos
- [ ] Logout funciona

### Performance:
- [ ] Tempo de resposta < 2s
- [ ] Sem erros no console
- [ ] SSL/HTTPS funcionando

---

## 8. 🔍 MONITORAMENTO

### Logs para Verificar:
```bash
# Backend logs no EasyPanel
# Verificar por:
- Conexão com banco OK
- JWT funcionando
- CORS configurado
- Erros de autenticação
```

### Métricas Importantes:
- [ ] Uptime > 99%
- [ ] Response time < 2s
- [ ] Error rate < 1%
- [ ] Database connections stable

---

## 9. 🔒 SEGURANÇA

### Checklist Final:
- [ ] JWT_SECRET único e seguro (256+ bits)
- [ ] DATABASE_URL não exposta
- [ ] HTTPS em todos os endpoints
- [ ] CORS restrito ao domínio
- [ ] Rate limiting ativo
- [ ] Headers de segurança configurados
- [ ] Google OAuth URLs atualizadas para produção

---

## 10. 🆘 TROUBLESHOOTING

### Problemas Comuns:

**Backend não inicia:**
- Verificar DATABASE_URL
- Verificar JWT_SECRET
- Verificar logs de erro

**Frontend não conecta no backend:**
- Verificar CORS
- Verificar URLs do backend
- Verificar headers HTTPS

**Banco não conecta:**
- Verificar DATABASE_URL
- Verificar se PostgreSQL está rodando
- Verificar credenciais

**🔑 Google OAuth não funciona (MAIS COMUM):**
- ❌ "redirect_uri_mismatch" → Atualizar URIs no Google Console
- ❌ "Origin not allowed" → Adicionar domínio nas origens JavaScript
- ❌ "CORS Error" → Verificar FRONTEND_URL no backend
- ❌ Popup não abre → Verificar se URLs estão corretas
- ❌ Redirect infinito → Verificar GOOGLE_REDIRECT_URL

### 🔧 Como Corrigir OAuth:
1. **Anotar URLs exatas do EasyPanel**
2. **Ir no Google Console → Credenciais**  
3. **Adicionar URLs EXATAS (com https://)**
4. **Reiniciar backend após atualizar variáveis**
5. **Testar em aba anônima do navegador**
- Verificar logs de erro

**Frontend não conecta no backend:**
- Verificar CORS
- Verificar URLs do backend
- Verificar headers HTTPS

**Banco não conecta:**
- Verificar DATABASE_URL
- Verificar se PostgreSQL está rodando
- Verificar credenciais

**OAuth não funciona:**
- Atualizar URLs no Google Console
- Verificar GOOGLE_CLIENT_ID/SECRET
- Verificar domínio autorizado

---

## ✅ DEPLOY COMPLETO!

Quando todos os itens estiverem marcados, seu sistema estará 100% funcional em produção! 🎉

### Próximos passos:
- [ ] Configurar backups automáticos
- [ ] Configurar monitoramento
- [ ] Configurar domínio customizado
- [ ] Configurar SSL personalizado (se necessário)
