'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const clothingTypes = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingtypes.json'), 'utf8')
      );

      const now = new Date();
      const clothingTypesWithTimestamps = clothingTypes.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('ClothingTypes', clothingTypesWithTimestamps, {});
      console.log('✅ Seeded ClothingTypes');
    } catch (error) {
      console.error('❌ Error seeding ClothingTypes:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ClothingTypes', null, {});
    console.log('✅ Rolled back ClothingTypes');
  }
};
