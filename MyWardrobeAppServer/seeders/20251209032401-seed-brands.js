'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const brands = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/brands.json'), 'utf8')
      );

      const now = new Date();
      const brandsWithTimestamps = brands.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('Brands', brandsWithTimestamps, {});
      console.log('✅ Seeded Brands');
    } catch (error) {
      console.error('❌ Error seeding Brands:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Brands', null, {});
    console.log('✅ Rolled back Brands');
  }
};
