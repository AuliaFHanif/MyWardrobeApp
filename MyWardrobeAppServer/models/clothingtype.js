'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClothingType extends Model {
    static associate(models) {
      // ClothingType has many ClothingItems
      ClothingType.hasMany(models.ClothingItem, {
        foreignKey: 'type_id',
        as: 'clothingItems'
      });
    }
  }
  ClothingType.init({
    type_name: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ClothingType',
  });
  return ClothingType;
};