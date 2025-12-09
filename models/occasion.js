'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Occasion extends Model {
    static associate(models) {
      // Occasion belongs to many ClothingItems through ClothingItemOccasion
      Occasion.belongsToMany(models.ClothingItem, {
        through: 'ClothingItemOccasion',
        foreignKey: 'occasion_id',
        otherKey: 'item_id',
        as: 'clothingItems'
      });
    }
  }
  Occasion.init({
    occasion_name: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Occasion',
    underscored: true
  });
  return Occasion;
};