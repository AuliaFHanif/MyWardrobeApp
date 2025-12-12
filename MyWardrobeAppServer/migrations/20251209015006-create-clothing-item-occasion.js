'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClothingItemOccasions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ClothingItems',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      occasion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Occasions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add composite unique constraint to prevent duplicate entries
    await queryInterface.addConstraint('ClothingItemOccasions', {
      fields: ['item_id', 'occasion_id'],
      type: 'unique',
      name: 'unique_item_occasion'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ClothingItemOccasions');
  }
};