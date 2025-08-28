const { sequelize, testConnection } = require('./config/database');
const { User, Mold, Roll, Project } = require('./models');

async function setupDatabase() {
    try {
        console.log('🔄 Iniciando setup do banco de dados...');
        console.log('📍 Database:', process.env.DB_NAME || 'sublimacalc');
        console.log('📍 Host:', process.env.DB_HOST || 'localhost');

        // Testar conexão
        console.log('🔌 Testando conexão com o banco...');
        await testConnection();

        // Sincronizar modelos (criar tabelas)
        console.log('📋 Criando/atualizando tabelas...');
        await sequelize.sync({ force: false, alter: true });

        console.log('✅ Setup do banco de dados concluído com sucesso!');
        console.log('\n📊 Tabelas criadas:');
        console.log('  - users (usuários)');
        console.log('  - molds (moldes)');
        console.log('  - rolls (bobinas)');
        console.log('  - projects (projetos)');

        // Verificar se existem dados
        const userCount = await User.count();
        const moldCount = await Mold.count();
        const rollCount = await Roll.count();
        const projectCount = await Project.count();

        console.log(`\n� Estatísticas do banco:`);
        console.log(`  �👥 Usuários: ${userCount}`);
        console.log(`  🔧 Moldes: ${moldCount}`);
        console.log(`  📜 Bobinas: ${rollCount}`);
        console.log(`  📊 Projetos: ${projectCount}`);

        if (userCount === 0) {
            console.log('\n💡 Dica: Para testar o sistema, faça login com Google OAuth');
        }

        // Verificar índices
        console.log('\n🔍 Verificando índices...');
        let indexes;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // PostgreSQL
            indexes = await sequelize.query(`
                SELECT tablename, indexname 
                FROM pg_indexes 
                WHERE schemaname = 'public'
                ORDER BY tablename, indexname;
            `);
        } else {
            // SQLite
            indexes = await sequelize.query(`
                SELECT name as indexname, tbl_name as tablename
                FROM sqlite_master 
                WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
                ORDER BY tbl_name, name;
            `);
        }

        console.log(`📋 Índices encontrados: ${indexes[0].length}`);

    } catch (error) {
        console.error('❌ Erro no setup do banco:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Executar setup se chamado diretamente
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('\n🎉 Setup finalizado! Você pode iniciar o servidor agora.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Falha no setup:', error.message);
            process.exit(1);
        });
}

module.exports = { setupDatabase };
