const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usar o caminho correto conforme config/database.js
const dbPath = path.join(__dirname, 'data', 'sublimacalc.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando usuários cadastrados...\n');
console.log(`📂 Caminho do banco: ${dbPath}\n`);

// Primeiro verificar se a tabela existe
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Erro ao listar tabelas:', err);
        db.close();
        return;
    }

    console.log('📋 Tabelas disponíveis:');
    tables.forEach(table => console.log(`   - ${table.name}`));
    console.log('');

    // Verificar se a tabela users existe
    const hasUsersTable = tables.some(table => table.name === 'users');

    if (!hasUsersTable) {
        console.log('❌ Tabela "users" não encontrada!');
        db.close();
        return;
    }

    // Consultar usuários
    db.all("SELECT id, name, email, provider, created_at, last_login FROM users ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error('❌ Erro ao consultar usuários:', err);
        } else if (rows.length === 0) {
            console.log('📋 Nenhum usuário encontrado no banco de dados');
        } else {
            console.log(`📊 Total de usuários: ${rows.length}\n`);
            rows.forEach((user, index) => {
                console.log(`👤 Usuário ${index + 1}:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Nome: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Provider: ${user.provider}`);
                console.log(`   Criado em: ${user.created_at}`);
                console.log(`   Último login: ${user.last_login || 'Nunca'}`);
                console.log('');
            });
        }

        db.close();
    });
});
