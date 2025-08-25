import React from 'react';
import ReactDOM from 'react-dom/client';
import CostCalculatorModule from './components/CostCalculatorModule.jsx';
import './styles/index.css';

// Mock do contexto de autenticação para versão standalone
const mockAuthContext = {
  user: { id: 'standalone-user', name: 'Usuário Local' },
  company: { id: 'local-company', name: 'Empresa Local' }
};

function StandaloneApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Calculadora de Custos
              </h1>
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Sublimação
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Versão Standalone v1.0.0
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CostCalculatorModule 
          authContext={mockAuthContext}
          isStandalone={true}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 VisualizaAI - Calculadora de Custos para Sublimação</p>
            <p className="mt-1">
              Desenvolvido para controle preciso de custos e margens de lucro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Renderizar a aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StandaloneApp />
  </React.StrictMode>
);
