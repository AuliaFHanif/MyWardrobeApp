'use strict';
const { hashPassword } = require('../helpers/bcrypt.js');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many ClothingItems
      User.hasMany(models.ClothingItem, {
        foreignKey: 'user_id',
        as: 'clothingItems'
      });
    }
  }
  User.init({
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,
    hooks: {
      beforeCreate: (user) => {
          user.password_hash = hashPassword(user.password_hash)
      },
      beforeUpdate: (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = hashPassword(user.password_hash)
        }
      },
    },
  });
  return User;
};