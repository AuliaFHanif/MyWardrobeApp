'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClothingItem extends Model {
    static associate(models) {
      // ClothingItem belongs to User
      ClothingItem.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // ClothingItem belongs to Brand
      ClothingItem.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        as: 'brand'
      });

      // ClothingItem belongs to ClothingType
      ClothingItem.belongsTo(models.ClothingType, {
        foreignKey: 'type_id',
        as: 'type'
      });

      // ClothingItem belongs to Color
      ClothingItem.belongsTo(models.Color, {
        foreignKey: 'color_id',
        as: 'color'
      });

      // ClothingItem belongs to many Occasions through ClothingItemOccasion
      ClothingItem.belongsToMany(models.Occasion, {
        through: 'ClothingItemOccasion',
        foreignKey: 'item_id',
        otherKey: 'occasion_id',
        as: 'occasions'
      });
    }
  }
  ClothingItem.init({
    user_id: DataTypes.INTEGER,
    brand_id: DataTypes.INTEGER,
    type_id: DataTypes.INTEGER,
    color_id: DataTypes.INTEGER,
    size: DataTypes.STRING,
    material: DataTypes.STRING,
    last_used: DataTypes.DATE,
    image_url: DataTypes.STRING,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ClothingItem',
    tableName: 'ClothingItems',
    underscored: true
  });
  return ClothingItem;
};
