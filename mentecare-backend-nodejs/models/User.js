const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.VIRTUAL,
    allowNull: true,
    validate: {
      len: [6, 100]
    }
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[\d\s\(\)\-\+]+$/
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Masculino', 'Feminino', 'Outro'),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    }
  },
  user_type: {
    type: DataTypes.ENUM('patient', 'professional'),
    allowNull: false,
    defaultValue: 'patient'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Método para hash da senha
User.prototype.setPassword = async function(password) {
  const saltRounds = 12;
  this.password_hash = await bcrypt.hash(password, saltRounds);
};

// Método para verificar senha
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Hook para hash automático da senha antes de salvar
User.beforeCreate(async (user) => {
  if (user.password) {
    await user.setPassword(user.password);
  }
});

User.beforeUpdate(async (user) => {
  if (user.password) {
    await user.setPassword(user.password);
  }
});

module.exports = User;

