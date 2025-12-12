'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClothingItemOccasion extends Model {
    static associate(models) {
      // Junction table - no additional associations needed
    }
  }
  ClothingItemOccasion.init({
    item_id: DataTypes.INTEGER,
    occasion_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ClothingItemOccasion',
  });
  return ClothingItemOccasion;
};