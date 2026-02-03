'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const clothingItems = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingitem.json'), 'utf8')
      );

      const now = new Date();
      const clothingItemsWithTimestamps = clothingItems.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('ClothingItems', clothingItemsWithTimestamps, {});
      console.log('✅ Seeded ClothingItems');
    } catch (error) {
      console.error('❌ Error seeding ClothingItems:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ClothingItems', null, {});
    console.log('✅ Rolled back ClothingItems');
  }
};
