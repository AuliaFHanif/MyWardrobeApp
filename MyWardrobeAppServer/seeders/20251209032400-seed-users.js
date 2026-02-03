'use strict';

const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../helpers/bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const users = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8')
      );

      const now = new Date();
      const usersWithTimestamps = users.map(item => ({
        ...item,
        password_hash: hashPassword(item.password_hash),
        created_at: now,
        updated_at: now
      }));

      await queryInterface.bulkInsert('Users', usersWithTimestamps, {});
      console.log('✅ Seeded Users');
    } catch (error) {
      console.error('❌ Error seeding Users:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
    console.log('✅ Rolled back Users');
  }
};
