'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const clothingItemOccasions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingitemoccasion.json'), 'utf8')
      );

      const now = new Date();
      const clothingItemOccasionsWithTimestamps = clothingItemOccasions.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('ClothingItemOccasions', clothingItemOccasionsWithTimestamps, {});
      console.log('✅ Seeded ClothingItemOccasions');
    } catch (error) {
      console.error('❌ Error seeding ClothingItemOccasions:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ClothingItemOccasions', null, {});
    console.log('✅ Rolled back ClothingItemOccasions');
  }
};
