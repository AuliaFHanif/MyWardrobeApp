'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    static associate(models) {
      // Color has many ClothingItems
      Color.hasMany(models.ClothingItem, {
        foreignKey: 'color_id',
        as: 'clothingItems'
      });
    }
  }
  Color.init({
    color_name: DataTypes.STRING,
    hex_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Color',
  });
  return Color;
};