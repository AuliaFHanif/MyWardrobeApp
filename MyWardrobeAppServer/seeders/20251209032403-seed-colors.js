'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const colors = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/colors.json'), 'utf8')
      );

      const now = new Date();
      const colorsWithTimestamps = colors.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('Colors', colorsWithTimestamps, {});
      console.log('✅ Seeded Colors');
    } catch (error) {
      console.error('❌ Error seeding Colors:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Colors', null, {});
    console.log('✅ Rolled back Colors');
  }
};
