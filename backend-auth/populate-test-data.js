/**
 * 🗃️ Script para popular dados de teste
 * 
 * Cria moldes e bobinas básicos para testar a calculadora
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configuração do banco
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'sublimacalc.sqlite'),
    logging: console.log
});

// Definir modelos básicos
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    google_id: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    avatar: DataTypes.TEXT,
    role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Mold = sequelize.define('Mold', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    width: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    height: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    thickness: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.6 },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    description: DataTypes.TEXT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'molds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Roll = sequelize.define('Roll', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    width: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    length: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    supplier: DataTypes.STRING,
    description: DataTypes.TEXT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'rolls',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

async function populateTestData() {
    try {
        console.log('🔄 Conectando ao banco...');
        await sequelize.authenticate();

        console.log('👤 Buscando primeiro usuário...');
        const user = await User.findOne({ where: { is_active: true } });

        if (!user) {
            throw new Error('❌ Nenhum usuário encontrado. Faça login primeiro.');
        }

        console.log(`✅ Usuário encontrado: ${user.name} (ID: ${user.id})`);

        // Verificar se já existem dados
        const existingMolds = await Mold.count({ where: { user_id: user.id } });
        const existingRolls = await Roll.count({ where: { user_id: user.id } });

        if (existingMolds > 0 && existingRolls > 0) {
            console.log('ℹ️ Dados já existem. Pulando inserção...');
            console.log(`📊 Moldes existentes: ${existingMolds}`);
            console.log(`📜 Bobinas existentes: ${existingRolls}`);
            return;
        }

        console.log('🔧 Criando moldes de teste...');

        const moldsData = [
            { name: 'Caneca 350ml', width: 9.0, height: 8.0, thickness: 0.6, cost: 2.50 },
            { name: 'Caneca 300ml', width: 8.5, height: 7.5, thickness: 0.6, cost: 2.30 },
            { name: 'Mousepad', width: 19.0, height: 23.0, thickness: 0.3, cost: 5.00 },
            { name: 'Camiseta P', width: 20.0, height: 25.0, thickness: 0.8, cost: 8.00 },
            { name: 'Camiseta M', width: 22.0, height: 27.0, thickness: 0.8, cost: 8.50 },
            { name: 'Camiseta G', width: 24.0, height: 29.0, thickness: 0.8, cost: 9.00 },
            { name: 'Almofada 30x30', width: 30.0, height: 30.0, thickness: 0.5, cost: 12.00 },
            { name: 'Quebra-cabeça', width: 18.0, height: 25.0, thickness: 0.4, cost: 6.50 },
            { name: 'Azulejo 15x15', width: 15.0, height: 15.0, thickness: 0.3, cost: 3.00 },
            { name: 'Placa Decorativa', width: 20.0, height: 30.0, thickness: 0.4, cost: 7.50 }
        ];

        const molds = [];
        for (const moldData of moldsData) {
            const mold = await Mold.create({
                ...moldData,
                user_id: user.id,
                description: `Molde para ${moldData.name} - ${moldData.width}x${moldData.height}cm`
            });
            molds.push(mold);
            console.log(`  ✅ Molde criado: ${mold.name}`);
        }

        console.log('📜 Criando bobinas de teste...');

        const rollsData = [
            { name: 'Papel 100g/m² - 61cm', width: 61.0, length: 100.0, cost: 85.00, supplier: 'Supplier A' },
            { name: 'Papel 100g/m² - 91cm', width: 91.0, length: 100.0, cost: 125.00, supplier: 'Supplier A' },
            { name: 'Papel 120g/m² - 61cm', width: 61.0, length: 100.0, cost: 95.00, supplier: 'Supplier B' },
            { name: 'Papel 120g/m² - 91cm', width: 91.0, length: 100.0, cost: 140.00, supplier: 'Supplier B' },
            { name: 'Papel A4 - Folhas', width: 21.0, length: 29.7, cost: 25.00, supplier: 'Office Supply' },
            { name: 'Tecido Poliéster - 150cm', width: 150.0, length: 50.0, cost: 180.00, supplier: 'Textile Co' }
        ];

        const rolls = [];
        for (const rollData of rollsData) {
            const roll = await Roll.create({
                ...rollData,
                user_id: user.id,
                description: `Bobina ${rollData.name} - ${rollData.width}cm x ${rollData.length}m`
            });
            rolls.push(roll);
            console.log(`  ✅ Bobina criada: ${roll.name}`);
        }

        console.log('\n🎉 Dados de teste criados com sucesso!');
        console.log(`📊 Total de moldes: ${molds.length}`);
        console.log(`📜 Total de bobinas: ${rolls.length}`);

        // Mostrar resumo
        console.log('\n📋 Resumo dos moldes:');
        molds.forEach(mold => {
            console.log(`  • ${mold.name}: ${mold.width}x${mold.height}cm - R$ ${mold.cost}`);
        });

        console.log('\n📋 Resumo das bobinas:');
        rolls.forEach(roll => {
            console.log(`  • ${roll.name}: ${roll.width}x${roll.length}cm - R$ ${roll.cost}`);
        });

    } catch (error) {
        console.error('❌ Erro ao popular dados:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    populateTestData()
        .then(() => {
            console.log('\n✅ Script concluído com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro no script:', error.message);
            process.exit(1);
        });
}

module.exports = { populateTestData };
