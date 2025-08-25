# Módulo de Calculadora de Custos - Sistema de Automação

## 📋 Visão Geral

O **Módulo de Calculadora de Custos** é um componente especializado do Sistema Web de Automação, projetado para empresas que trabalham com sublimação. Este módulo oferece cálculos precisos de custos de produção, gerenciamento de projetos e relatórios profissionais.

## 🏗️ Arquitetura de Integração

```
SISTEMA WEB DE AUTOMAÇÃO
├─ INTERFACE DO USUÁRIO (VISUAL)
├─ NÚCLEO DE MÓDULOS FUNCIONAIS
│  ├─ [ Contas e Autenticação ] ←----→ [ Assinaturas e Faturamento ]
│  ├─ [ Projetos e Produção (2D) ] ←→ [ **CALCULADORA DE CUSTOS** ] ← NOVO MÓDULO
│  └─ [ Visualização 3D ] ←----------→ [ Dashboard e Relatórios ]
├─ BANCO DE DADOS (Dados de Negócio)
├─ ARMAZENAMENTO DE ARQUIVOS (SVGs, PDFs, ARQs)
└─ GATEWAY DE PAGAMENTO (Para Módulo de Assinaturas)
```

## 🔧 Funcionalidades Principais

### ✅ **Isolamento por Empresa**
- Dados completamente separados por empresa logada
- Cada empresa tem seus próprios moldes, bobinas e projetos
- Controle de acesso baseado em roles e permissões

### ✅ **Cálculo Avançado de Custos**
- Otimização automática do uso de papel
- Cálculo de margem de lucro
- Custos adicionais (mão de obra, energia, etc.)
- Preço de venda automático

### ✅ **Gestão de Projetos**
- Histórico completo de projetos
- Busca e filtros avançados
- Versionamento de cálculos
- Backup e restauração

### ✅ **Relatórios Profissionais**
- Exportação em PDF personalizado
- Relatórios consolidados
- Analytics e dashboards
- Gráficos interativos

## 📁 Estrutura de Arquivos

```
frontend/
├─ src/
│  ├─ components/
│  │  └─ CostCalculator/
│  │     ├─ CostCalculatorModule.jsx       # Componente principal
│  │     ├─ ConfigurationTab.jsx          # Configurações
│  │     ├─ PlanningTab.jsx              # Planejamento
│  │     ├─ ProjectsTab.jsx              # Projetos salvos
│  │     └─ AnalyticsTab.jsx             # Analytics
│  ├─ services/
│  │  ├─ StorageService.js               # Gerenciamento de dados
│  │  └─ PDFService.js                   # Geração de PDFs
│  └─ modules/
│     └─ costCalculator/
│        └─ config.js                    # Configuração do módulo

backend/
├─ routes/
│  └─ costCalculator.js                  # Rotas da API
├─ services/
│  └─ CostCalculatorService.js          # Lógica de negócio
└─ models/
   └─ CostCalculatorData.js             # Modelo de dados
```

## 🚀 Como Integrar

### 1. **Frontend Integration**

```javascript
// App.jsx - Adicionar rota do módulo
import { costCalculatorRoutes } from './modules/costCalculator/config';

function App() {
  return (
    <Routes>
      {/* Rotas existentes */}
      {costCalculatorRoutes.map(route => (
        <Route key={route.path} {...route} />
      ))}
    </Routes>
  );
}
```

### 2. **Menu Integration**

```javascript
// Adicionar ao menu principal
const menuItems = [
  // ... itens existentes
  {
    label: 'Calculadora de Custos',
    icon: '💰',
    route: '/cost-calculator',
    permissions: ['cost_calculator_view']
  }
];
```

### 3. **Backend Integration**

```javascript
// server.js - Adicionar rotas
const costCalculatorRoutes = require('./routes/costCalculator');
app.use('/api/companies', costCalculatorRoutes);
```

## 🔐 Sistema de Permissões

### **Permissões Necessárias:**
- `cost_calculator_view` - Visualizar o módulo
- `cost_calculator_edit` - Editar configurações
- `cost_calculator_projects` - Gerenciar projetos
- `cost_calculator_analytics` - Ver relatórios
- `cost_calculator_export` - Exportar dados

### **Roles Sugeridas:**
- **Operador**: view, edit
- **Gerente**: view, edit, projects, analytics
- **Admin**: todas as permissões

## 📊 Banco de Dados

### **Tabela: CostCalculatorData**
```sql
{
  objectId: String (Parse ID),
  companyId: String (ID da empresa),
  molds: Array (Moldes cadastrados),
  rolls: Array (Tipos de bobina),
  projects: Array (Projetos salvos),
  settings: Object (Configurações),
  lastCalculation: Date,
  updatedBy: String (ID do usuário),
  ACL: Parse ACL (Controle de acesso),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Benefícios da Integração

### **Para o Sistema:**
- ✅ Módulo completamente isolado
- ✅ Não interfere em funcionalidades existentes
- ✅ Segue padrões arquiteturais do sistema
- ✅ Fácil manutenção e updates

### **Para as Empresas:**
- ✅ Cálculos precisos de custos
- ✅ Otimização de uso de materiais
- ✅ Relatórios profissionais para clientes
- ✅ Histórico completo de projetos
- ✅ Analytics para tomada de decisão

### **Para os Usuários:**
- ✅ Interface intuitiva e moderna
- ✅ Responsivo (mobile-friendly)
- ✅ Exportação em PDF
- ✅ Dados sempre sincronizados

## 🔄 Fluxo de Uso

1. **Login da Empresa** → Sistema autentica e identifica empresa
2. **Configuração** → Cadastra moldes e tipos de bobina
3. **Planejamento** → Adiciona itens e configura projeto
4. **Cálculo** → Sistema otimiza e calcula custos automaticamente
5. **Projeto** → Salva para histórico da empresa
6. **Relatório** → Exporta PDF profissional
7. **Analytics** → Acompanha performance ao longo do tempo

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js, TailwindCSS, Chart.js
- **Backend**: Node.js, Express, Parse Server
- **PDF**: jsPDF
- **Storage**: Parse Server + localStorage (fallback)
- **Auth**: Sistema de autenticação existente

## 📈 Roadmap Futuro

- [ ] Integração com fornecedores (preços automáticos)
- [ ] IA para otimização de cortes
- [ ] Integração com estoque
- [ ] App mobile dedicado
- [ ] Integração com sistemas de ERP

---

**🎯 Resultado**: Um módulo completo, profissional e totalmente integrado ao sistema existente, oferecendo uma solução robusta para cálculo de custos de sublimação com isolamento total de dados por empresa!
