'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const occasions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/occasions.json'), 'utf8')
      );

      const now = new Date();
      const occasionsWithTimestamps = occasions.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('Occasions', occasionsWithTimestamps, {});
      console.log('✅ Seeded Occasions');
    } catch (error) {
      console.error('❌ Error seeding Occasions:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Occasions', null, {});
    console.log('✅ Rolled back Occasions');
  }
};
