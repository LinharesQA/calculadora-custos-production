// Configuração do ambiente
window.APP_CONFIG = {
    // URLs dos serviços
    BACKEND_URLS: {
        development: 'http://localhost:3001/api',
        production: 'https://evo-api-calculadora-backend.usg3xn.easypanel.host/api'
    },

    // Detecção automática do ambiente
    getEnvironment() {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }

        return 'production';
    },

    // Obter URL do backend para o ambiente atual
    getBackendURL() {
        const env = this.getEnvironment();
        return this.BACKEND_URLS[env];
    },

    // Configurações específicas por ambiente
    DEBUG: window.location.hostname === 'localhost',

    // Timeouts e outras configurações
    REQUEST_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
};

// Log da configuração (apenas em desenvolvimento)
if (window.APP_CONFIG.DEBUG) {
    console.log('🔧 Configuração da aplicação:', {
        environment: window.APP_CONFIG.getEnvironment(),
        backendURL: window.APP_CONFIG.getBackendURL(),
        debug: window.APP_CONFIG.DEBUG
    });
}
