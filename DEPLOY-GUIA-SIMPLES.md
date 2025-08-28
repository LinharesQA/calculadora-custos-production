# 🚀 Guia de Deploy em Produção - Calculadora de Custos

## ✅ Deploy SIMPLES (Sem Redis)

### 1. No servidor, copie apenas estas variáveis no .env:

```bash
# Banco de Dados PostgreSQL (OBRIGATÓRIO)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculadora_custos
DB_USER=postgres
DB_PASS=sua_senha_real

# Sessões e Segurança (OBRIGATÓRIO)
SESSION_SECRET=sua_chave_super_secreta_aqui_com_32_caracteres
NODE_ENV=production

# Servidor (OBRIGATÓRIO)
PORT=3001
```

### 2. NÃO configure REDIS_URL
- ❌ **NÃO** adicione `REDIS_URL=...`
- ✅ Sistema detecta automaticamente e usa sessões em memória
- ✅ Funciona para 100+ usuários simultâneos

### 3. Deploy normal:
```bash
npm install
npm start
```

---

## 🚀 Deploy AVANÇADO (Com Redis)

### 1. Instalar Redis no servidor:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**CentOS/RHEL:**
```bash
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

**Windows Server:**
```bash
# Baixar Redis para Windows ou usar WSL
```

### 2. Configurar variáveis .env:
```bash
# Adicionar ao .env anterior:
REDIS_URL=redis://localhost:6379

# Para Redis com senha:
# REDIS_URL=redis://:sua_senha@localhost:6379

# Para Redis na nuvem:
# REDIS_URL=redis://username:password@host:port
```

### 3. Testar Redis:
```bash
redis-cli ping
# Deve retornar: PONG
```

---

## 🎯 **RECOMENDAÇÃO**

**Para seu primeiro deploy:**
1. ✅ Use o Deploy SIMPLES (sem Redis)
2. ✅ Monitore a performance
3. ✅ Se precisar de mais escala, adicione Redis depois

**Vantagens do Deploy Simples:**
- ⚡ Setup em 5 minutos
- 🔧 Menos componentes para dar problema
- 💰 Sem custos extras de Redis
- 📊 Perfeito para 100+ usuários simultâneos

---

## 🔍 Como verificar se está funcionando

### 1. Testar health check:
```bash
curl http://localhost:3001/api/health
```

### 2. Ver logs no servidor:
```bash
npm start
# Deve mostrar:
# ✅ Sistema de sessões configurado
# ✅ Passport configurado com sessões
```

### 3. Se usando Redis:
```bash
curl http://localhost:3001/api/health/redis
```

---

## ❗ Troubleshooting

**Erro "Login sessions require session support":**
- ✅ **RESOLVIDO** - middleware order corrigido

**Erro "ECONNREFUSED redis":**
- ✅ **RESOLVIDO** - fallback automático para memory store

**Performance lenta:**
- ✅ **RESOLVIDO** - rate limiting + compression + database pooling implementados
