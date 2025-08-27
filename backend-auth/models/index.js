const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo de Usuário
const User = sequelize.define('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    google_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    provider: {
        type: DataTypes.STRING,
        defaultValue: 'google'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['google_id'] },
        { fields: ['email'] },
        { fields: ['is_active'] }
    ]
});

// Modelo de Moldes
const Mold = sequelize.define('molds', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    width: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    height: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    area: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.width * this.height;
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'is_active'] }
    ]
});

// Modelo de Bobinas
const Roll = sequelize.define('rolls', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    width: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'is_active'] }
    ]
});

// Modelo de Projetos
const Project = sequelize.define('projects', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roll_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Roll,
            key: 'id'
        }
    },
    roll_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    roll_length: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    profit_margin: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 30.00
    },
    additional_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_profit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    calculation_data: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'calculated', 'completed'),
        defaultValue: 'draft'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        { fields: ['user_id'] },
        { fields: ['user_id', 'status'] },
        { fields: ['user_id', 'is_active'] }
    ]
});

// Relacionamentos
User.hasMany(Mold, { foreignKey: 'user_id', as: 'molds' });
User.hasMany(Roll, { foreignKey: 'user_id', as: 'rolls' });
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });

Mold.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Roll.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Project.belongsTo(Roll, { foreignKey: 'roll_id', as: 'roll' });

module.exports = {
    User,
    Mold,
    Roll,
    Project,
    sequelize
};
