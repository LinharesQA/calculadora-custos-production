// Script para testar se o usuário está autenticado
console.log('🔍 Verificando autenticação...');

// Verificar se há token no localStorage
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Existe' : 'Não existe');

// Verificar se há dados do usuário
const userData = localStorage.getItem('user_data');
console.log('User data:', userData ? JSON.parse(userData) : 'Não existe');

// Testar API se há token
if (token) {
    fetch('/api/molds', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Teste API moldes:', data);
        })
        .catch(error => {
            console.error('❌ Erro API moldes:', error);
        });
} else {
    console.log('⚠️ Você precisa fazer login primeiro!');
}
