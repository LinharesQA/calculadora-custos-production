# ✅ Checklist de Deploy - EasyPanel

## Pré-Deploy
- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Build funcionando (`npm run build`)
- [ ] Preview local testado (`npm run preview`)
- [ ] Arquivos importantes presentes:
  - [ ] `package.json`
  - [ ] `easypanel.json`
  - [ ] `vite.config.js`
  - [ ] `src/` (código fonte)

## Configuração EasyPanel
- [ ] Conta no EasyPanel criada
- [ ] Projeto criado como "Static Site"
- [ ] Configurações corretas:
  - [ ] Framework: `Vite`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`
  - [ ] Node Version: `18`

## Deploy
- [ ] Repositório conectado (GitHub) OU arquivo ZIP enviado
- [ ] Deploy iniciado
- [ ] Build bem-sucedido (sem erros)
- [ ] Site acessível na URL configurada

## Pós-Deploy
- [ ] Página inicial carrega
- [ ] Interface responsiva (testar mobile/desktop)
- [ ] Funcionalidades principais:
  - [ ] Calculadora de custos funciona
  - [ ] Campos de entrada aceitam valores
  - [ ] Cálculos são realizados corretamente
  - [ ] Resultados são exibidos
- [ ] Recursos avançados:
  - [ ] Geração de PDF funciona
  - [ ] Gráficos/charts aparecem
  - [ ] Salvamento local funciona
  - [ ] Dados persistem após reload

## Solução de Problemas
### Build Falha
- [ ] Verificar logs no EasyPanel
- [ ] Testar build local: `npm run build`
- [ ] Verificar dependências: `npm install`

### Site não carrega
- [ ] Verificar Output Directory = `dist`
- [ ] Verificar se build gerou arquivos
- [ ] Verificar logs do deploy

### Funcionalidades não funcionam
- [ ] Abrir DevTools (F12)
- [ ] Verificar erros no Console
- [ ] Verificar se assets carregaram
- [ ] Verificar conexão com CDNs

## Informações do Projeto
```
Nome: calculadora-custos-sublimacao
Tipo: Static Site (SPA React)
Framework: Vite
Build: npm run build
Output: dist/
Runtime: Frontend only (sem backend)
```

## URLs Importantes
- Desenvolvimento: `http://localhost:3001`
- Produção: `https://[seu-dominio].easypanel.com`
- Repositório: `[seu-github-repo]`

## Suporte
- Documentação EasyPanel: https://easypanel.io/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

---
**🎉 Parabéns! Seu projeto está pronto para deploy!**
