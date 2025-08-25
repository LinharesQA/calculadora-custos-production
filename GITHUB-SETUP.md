# INSTRUÇÕES PARA GITHUB - Calculadora de Custos

## 🎯 Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Configure:
   - Repository name: `calculadora-custos`
   - Description: `Calculadora de Custos para Sublimação - React + Vite`
   - Visibilidade: `Public` (para EasyPanel gratuito) ou `Private`
   - ❌ NÃO marque "Add a README file" (já temos)
   - ❌ NÃO marque "Add .gitignore" (já temos)
   - ❌ NÃO marque "Choose a license"

3. Clique em "Create repository"

## 🔗 Passo 2: Conectar Repositório Local

Após criar o repositório, execute estes comandos no PowerShell:

```powershell
# Substitua SEU-USUARIO pelo seu nome de usuário do GitHub
git remote add origin https://github.com/SEU-USUARIO/calculadora-custos.git
git branch -M main  
git push -u origin main
```

## 📱 Passo 3: Configurar EasyPanel

1. No EasyPanel, vá na aba "Source"
2. Clique em "Github"
3. Autorize a conexão com GitHub
4. Selecione o repositório: `calculadora-custos`
5. Branch: `main`
6. Auto-deploy: `Habilitado`

## ⚙️ Configurações que serão aplicadas automaticamente:

O arquivo `easypanel.json` configurará:
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `dist`
- Framework: `Vite`
- Node Version: `18`

## 🚀 Deploy Automático

Após conectar:
- Todo push para branch `main` fará deploy automático
- Você receberá notificações por email
- Logs de build ficam disponíveis no painel

## 🔄 Para fazer updates no futuro:

```powershell
# Fazer mudanças no código
git add .
git commit -m "fix: sua mensagem de commit"
git push
# Deploy automático acontece!
```

## 🆘 Se der problema:

1. Verificar se repositório está público (para plano gratuito)
2. Verificar se branch é `main` (não `master`)
3. Verificar logs de build no EasyPanel
4. Testar build local: `npm run build`

## 📞 Suporte:
- GitHub: https://docs.github.com
- EasyPanel: https://easypanel.io/docs
