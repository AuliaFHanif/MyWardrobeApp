'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      // Brand has many ClothingItems
      Brand.hasMany(models.ClothingItem, {
        foreignKey: 'brand_id',
        as: 'clothingItems'
      });
    }
  }
  Brand.init({
    brand_name: DataTypes.STRING,
    website: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Brand',
    underscored: true
  });
  return Brand;
};