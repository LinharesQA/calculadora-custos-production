# 🔧 Configuração Google OAuth para Produção

## ⚠️ IMPORTANTE: Atualizar URLs do Google OAuth

Quando fizer deploy no EasyPanel, você **DEVE** atualizar as configurações do Google Console para usar as URLs de produção.

---

## 📍 URLs que Mudam:

### Desenvolvimento (atual):
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

### Produção (EasyPanel):
```
Frontend: https://sua-calculadora.easypanel.app
Backend:  https://sua-calculadora-api.easypanel.app
```

---

## 🔧 Configurações no Google Console

### 1. Acessar Google Cloud Console:
```
https://console.developers.google.com/
```

### 2. Ir para "Credenciais" > Seu OAuth Client

### 3. Atualizar "Origens JavaScript autorizadas":
```
# ADICIONAR (manter as locais para dev):
https://sua-calculadora.easypanel.app
https://sua-calculadora-api.easypanel.app

# MANTER para desenvolvimento:
http://localhost:5173
http://localhost:3000
```

### 4. Atualizar "URIs de redirecionamento autorizados":
```
# ADICIONAR:
https://sua-calculadora-api.easypanel.app/api/auth/google/callback
https://sua-calculadora.easypanel.app/login

# MANTER para desenvolvimento:
http://localhost:3000/api/auth/google/callback
http://localhost:5173/login
```

---

## 🔧 Variáveis de Ambiente de Produção

### Backend (EasyPanel):
```env
# URLs corretas para produção
FRONTEND_URL=https://sua-calculadora.easypanel.app
GOOGLE_REDIRECT_URL=https://sua-calculadora-api.easypanel.app/api/auth/google/callback

# Mesmos IDs (não mudam)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
```

### Frontend (se necessário):
```env
# URL da API em produção
VITE_API_URL=https://sua-calculadora-api.easypanel.app
```

---

## 📝 Checklist de Atualização:

### Antes do Deploy:
- [ ] Anotar as URLs que o EasyPanel vai gerar
- [ ] Definir nomes dos serviços no EasyPanel

### Durante o Deploy:
- [ ] Fazer deploy e anotar URLs finais
- [ ] Atualizar Google Console com URLs reais

### Após o Deploy:
- [ ] Testar login com Google OAuth
- [ ] Verificar se redirecionamento funciona
- [ ] Confirmar que JWT é gerado corretamente

---

## 🚨 Problemas Comuns:

### "OAuth Error: redirect_uri_mismatch"
**Causa**: URL de callback não autorizada no Google Console
**Solução**: Adicionar URL exata do backend + `/api/auth/google/callback`

### "Origin not allowed"
**Causa**: Domínio frontend não autorizado
**Solução**: Adicionar URL do frontend nas origens JavaScript

### "CORS Error"
**Causa**: Backend não reconhece frontend
**Solução**: Atualizar `FRONTEND_URL` no backend

---

## 🔧 Configuração no Código

O sistema já está preparado para produção! As URLs são lidas das variáveis de ambiente:

### Backend (`backend-auth/config/passport.js`):
```javascript
// Já configurado para usar variáveis de ambiente
callbackURL: process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/google/callback'
```

### CORS (`backend-auth/server.js`):
```javascript
// Já configurado para usar FRONTEND_URL
origin: process.env.FRONTEND_URL || 'http://localhost:5173'
```

---

## 📋 Template de URLs para Google Console:

### Quando souber suas URLs do EasyPanel, use este template:

**Origens JavaScript autorizadas:**
```
http://localhost:5173
http://localhost:3000
https://[SEU-FRONTEND].easypanel.app
https://[SEU-BACKEND].easypanel.app
```

**URIs de redirecionamento:**
```
http://localhost:3000/api/auth/google/callback
http://localhost:5173/login
https://[SEU-BACKEND].easypanel.app/api/auth/google/callback
https://[SEU-FRONTEND].easypanel.app/login
```

---

## ✅ Teste Final:

Depois de configurar tudo:

1. **Acessar frontend em produção**
2. **Clicar em "Login com Google"**  
3. **Verificar se abre popup do Google**
4. **Autorizar aplicação**
5. **Verificar se volta para dashboard logado**

Se tudo funcionar, seu OAuth está configurado corretamente! 🎉

---

## 📞 Resumo do Fluxo:

1. **Deploy no EasyPanel** → Anota URLs geradas
2. **Atualiza Google Console** → Adiciona URLs de produção  
3. **Configura variáveis** → FRONTEND_URL + GOOGLE_REDIRECT_URL
4. **Testa OAuth** → Login com Google funcionando

**Não esqueça deste passo! É crucial para o OAuth funcionar! 🔑**
