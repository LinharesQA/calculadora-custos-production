#!/usr/bin/env node

/**
 * SublimaCalc - Database Setup Script
 * Este script configura o banco de dados automaticamente (SQLite ou PostgreSQL)
 */

const { sequelize } = require('./config/database');

async function setupDatabase() {
    try {
        console.log('🔄 Configurando banco de dados...');

        // Testar conexão
        await sequelize.authenticate();
        const dbType = sequelize.getDialect();
        console.log(`✅ Conectado ao ${dbType.toUpperCase()} com sucesso!`);

        // Sincronizar modelos (criar tabelas)
        console.log('🔨 Criando/verificando tabelas...');
        await sequelize.sync({ force: false }); // force: false = não apagar dados
        console.log('✅ Tabelas configuradas com sucesso!');

        console.log('🎉 Banco de dados pronto para uso!');

        // Informações úteis
        if (dbType === 'sqlite') {
            console.log('📁 Banco SQLite criado em: data/sublimacalc.sqlite');
            console.log('💡 Para produção, configure DATABASE_URL no .env');
        } else {
            console.log('🐘 Usando banco PostgreSQL');
            console.log('💾 Lembre-se de configurar backups regulares');
        }

    } catch (error) {
        console.error('❌ Erro ao configurar banco:', error.message);

        // Diagnóstico do erro
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n🔧 Diagnóstico:');
            console.log('- PostgreSQL não está rodando ou não está acessível');
            console.log('- Para desenvolvimento: remova DATABASE_URL e FORCE_POSTGRES do .env');
            console.log('- Para produção: verifique servidor PostgreSQL');
        } else if (error.message.includes('authentication')) {
            console.log('\n🔧 Diagnóstico:');
            console.log('- Credenciais incorretas');
            console.log('- Verifique DB_USER e DB_PASSWORD no .env');
        } else if (error.message.includes('SQLITE')) {
            console.log('\n🔧 Diagnóstico:');
            console.log('- Erro com SQLite');
            console.log('- Verifique permissões da pasta data/');
        }

        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexão fechada');
    }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
