# 🔐 VARIÁVEIS DE AMBIENTE PARA EASYPANEL

## Copie e cole estas variáveis na configuração do EasyPanel:

### OBRIGATÓRIAS:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=[COLAR_URL_DO_POSTGRESQL_AQUI]
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c284f5c4c7f4d5f5e3b5c5a5e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8
FRONTEND_URL=https://[NOME-DO-SEU-FRONTEND].easypanel.app
```

### GOOGLE OAUTH (se usar):
```env
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui
```

### OPCIONAIS (configurações de segurança):
```env
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## 📋 SUBSTITUIR:

1. **DATABASE_URL**: Colar a URL do PostgreSQL do EasyPanel
2. **FRONTEND_URL**: Substituir pelo domínio real do frontend
3. **GOOGLE_CLIENT_ID/SECRET**: Seus dados do Google Console (se usar OAuth)

---

## ⚠️ IMPORTANTE:

- **JWT_SECRET**: Já foi gerado seguramente acima
- **DATABASE_URL**: Será fornecida pelo EasyPanel ao criar PostgreSQL
- **FRONTEND_URL**: Será definida após deploy do frontend

---

## 🎯 ORDEM DE CONFIGURAÇÃO:

1. **Deploy PostgreSQL** → Copiar DATABASE_URL
2. **Deploy Backend** → Usar essas variáveis  
3. **Deploy Frontend** → Atualizar FRONTEND_URL
4. **Configurar Google** → Adicionar URLs finais

**Salve este arquivo para referência! 💾**
