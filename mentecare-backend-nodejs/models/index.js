const { sequelize } = require('../config/database');
const User = require('./User');
const Professional = require('./Professional');

// Definir todas as associações aqui
User.hasOne(Professional, {
  foreignKey: 'user_id',
  as: 'professional'
});

Professional.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Professional
};

