const { Sequelize } = require('sequelize');
const path = require('path');

// Detectar ambiente e configurar banco apropriado
function createSequelizeInstance() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseUrl = process.env.DATABASE_URL;

    console.log(`🔧 Configurando banco para ambiente: ${nodeEnv}`);

    // Se tem DATABASE_URL (produção), usar PostgreSQL
    if (databaseUrl) {
        console.log('🐘 Conectando ao PostgreSQL remoto...');
        return new Sequelize(databaseUrl, {
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 20,
                min: 5,
                acquire: 60000,
                idle: 10000
            },
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true
            },
            dialectOptions: {
                ssl: nodeEnv === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            }
        });
    }

    // Verificar se PostgreSQL está disponível localmente
    if (nodeEnv === 'production' || process.env.FORCE_POSTGRES === 'true') {
        console.log('🐘 Conectando ao PostgreSQL local...');
        return new Sequelize({
            database: process.env.DB_NAME || 'sublimacalc',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 20,
                min: 5,
                acquire: 60000,
                idle: 10000
            },
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true
            }
        });
    }

    // Fallback para SQLite (desenvolvimento local)
    console.log('🗂️ Usando SQLite para desenvolvimento local...');
    const dbPath = path.join(__dirname, '..', 'data', 'sublimacalc.sqlite');

    return new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    });
}

// Criar instância do Sequelize
const sequelize = createSequelizeInstance();

// Teste de conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        const dbType = sequelize.getDialect();
        console.log(`✅ Conexão com ${dbType.toUpperCase()} estabelecida com sucesso`);
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error.message);
        throw error;
    }
}

module.exports = {
    sequelize,
    testConnection
};
