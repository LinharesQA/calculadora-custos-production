# 🚀 Deploy no EasyPanel

## Instruções passo a passo para fazer deploy da Calculadora de Custos

### 📋 Pré-requisitos
- Conta no EasyPanel
- Projeto no GitHub (recomendado) ou ZIP dos arquivos
- Node.js 18+ (já configurado no easypanel.json)

### 🔧 Passos para Deploy

#### 1. **Preparar os arquivos**
Certifique-se de que o projeto tem todos os arquivos necessários:
```bash
calculadora-custos/
├── index.html          # ✅ Entry point
├── package.json        # ✅ Dependências e scripts
├── vite.config.js      # ✅ Configuração do Vite
├── easypanel.json      # ✅ Configuração do EasyPanel
├── src/                # ✅ Código fonte React
├── backend/            # ✅ Serviços (opcional)
└── dist/               # ✅ Build gerado (criado automaticamente)
```

#### 2. **Testar o build localmente (Opcional)**
```bash
# Instalar dependências
npm install

# Fazer build
npm run build

# Testar localmente
npm run preview
```

#### 3. **Upload dos arquivos**

**Opção A - Via Git (Recomendado):**
#### 3. **Criar projeto no EasyPanel**

**Opção A - Via GitHub (Recomendado):**
1. Acesse seu painel do EasyPanel
2. Clique em **"New Project"**
3. Escolha **"Static Site"**
4. Conecte com GitHub e selecione o repositório
5. Configure:
   - **Name**: `calculadora-custos-sublimacao`
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node Version**: `18`
   - **Domain**: `calculadora.seudominio.com` (ou subdomínio desejado)

**Opção B - Upload direto:**
1. Compacte a pasta do projeto (incluindo package.json e src/)
2. No EasyPanel, selecione upload de arquivo
3. Configure as mesmas opções acima

#### 4. **Configurações no EasyPanel**

As configurações estão no arquivo `easypanel.json`:
```json
{
  "name": "calculadora-custos-sublimacao",
  "type": "static",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "nodeVersion": "18"
}
```

#### 5. **Variáveis de Ambiente**
Não são necessárias para esta aplicação frontend-only.

#### 6. **Deploy**
1. Clique em **"Deploy"**
2. Aguarde o processo (geralmente 1-2 minutos)
3. Acesse o domínio configurado

### ✅ **Verificação Pós-Deploy**

Após o deploy, teste:
- [ ] Página carrega corretamente
- [ ] Interface responsiva (mobile/desktop)
- [ ] Funcionalidades de cálculo funcionando
- [ ] Geração de PDF funcionando
- [ ] Salvamento de projetos (localStorage)
- [ ] Gráficos e charts carregando
- [ ] Todas as rotas funcionando

### �️ **Scripts Úteis**

Execute no PowerShell para facilitar o desenvolvimento:
```powershell
# Execute o script interativo
.\deploy-scripts.ps1

# Ou comandos individuais:
npm install      # Instalar dependências
npm run build    # Fazer build
npm run preview  # Testar localmente
```

### �🔧 **Solução de Problemas**

**Problema**: Build falha
- **Solução**: Verifique se todas as dependências estão instaladas: `npm install`

**Problema**: Página não carrega após deploy
- **Solução**: Verifique se o Output Directory está configurado como `dist`

**Problema**: 404 em assets
- **Solução**: Verifique se o `base: './'` está no vite.config.js

**Problema**: Funcionalidades React não funcionam
- **Solução**: Verifique se o build foi feito corretamente e se há erros no console

### 📱 **Características da Aplicação**

- ✅ **SPA React** - Single Page Application
- ✅ **Vite Build** - Build otimizado e rápido
- ✅ **Responsivo** - TailwindCSS
- ✅ **PDF Generation** - jsPDF integrado
- ✅ **Charts** - Chart.js para gráficos
- ✅ **Local Storage** - Dados persistidos localmente
- ✅ **Modular** - Componentes reutilizáveis

### 🌐 **URLs e Domínios**

Configure no EasyPanel:
- Produção: `https://calculadora.seudominio.com`
- Staging: `https://calc-dev.seudominio.com` (opcional)

### 📊 **Monitoramento no EasyPanel**

Recursos disponíveis:
- ✅ Uptime monitoring
- ✅ Deploy logs
- ✅ Build logs
- ✅ Custom domains
- ✅ SSL automático
- ✅ CDN global

### 🚀 **Deploy Automático**

Para deploy automático via GitHub:
1. Conecte o repositório no EasyPanel
2. Configure webhook automático
3. Todo push na branch main fará deploy automático
4. Receba notificações por email

### 💡 **Dicas de Performance**

- ✅ Vite otimiza automaticamente o bundle
- ✅ Assets são comprimidos automaticamente
- ✅ CSS é minificado
- ✅ Dead code elimination ativo
- ✅ Tree shaking habilitado
- Performance

---

**🎉 Pronto!** Sua calculadora de custos está online e funcional!
