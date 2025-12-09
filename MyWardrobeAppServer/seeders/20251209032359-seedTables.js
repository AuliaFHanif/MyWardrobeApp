'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Read JSON files
      const users = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8')
      );
      const brands = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/brands.json'), 'utf8')
      );
      const clothingTypes = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingtypes.json'), 'utf8')
      );
      const colors = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/colors.json'), 'utf8')
      );
      const occasions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/occasions.json'), 'utf8')
      );
      const clothingItems = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingitem.json'), 'utf8')
      );
      const clothingItemOccasions = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/clothingitemoccasion.json'), 'utf8')
      );

      // Add timestamps to each record
      const now = new Date();
      
      const usersWithTimestamps = users.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const brandsWithTimestamps = brands.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const clothingTypesWithTimestamps = clothingTypes.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const colorsWithTimestamps = colors.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const occasionsWithTimestamps = occasions.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const clothingItemsWithTimestamps = clothingItems.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      const clothingItemOccasionsWithTimestamps = clothingItemOccasions.map(item => ({
        ...item,
        created_at: now,
        updated_at: now
      }));

      // Bulk insert data in correct order (respecting foreign keys)
      await queryInterface.bulkInsert('Users', usersWithTimestamps, {});
      console.log('✅ Seeded Users');

      await queryInterface.bulkInsert('Brands', brandsWithTimestamps, {});
      console.log('✅ Seeded Brands');

      await queryInterface.bulkInsert('ClothingTypes', clothingTypesWithTimestamps, {});
      console.log('✅ Seeded ClothingTypes');

      await queryInterface.bulkInsert('Colors', colorsWithTimestamps, {});
      console.log('✅ Seeded Colors');

      await queryInterface.bulkInsert('Occasions', occasionsWithTimestamps, {});
      console.log('✅ Seeded Occasions');

      await queryInterface.bulkInsert('ClothingItems', clothingItemsWithTimestamps, {});
      console.log('✅ Seeded ClothingItems');

      await queryInterface.bulkInsert('ClothingItemOccasions', clothingItemOccasionsWithTimestamps, {});
      console.log('✅ Seeded ClothingItemOccasions');

      console.log('🎉 All seed data inserted successfully!');
    } catch (error) {
      console.error('❌ Error seeding data:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded data in reverse order (respecting foreign keys)
    await queryInterface.bulkDelete('ClothingItemOccasions', null, {});
    console.log('✅ Rolled back ClothingItemOccasions');

    await queryInterface.bulkDelete('ClothingItems', null, {});
    console.log('✅ Rolled back ClothingItems');

    await queryInterface.bulkDelete('Occasions', null, {});
    console.log('✅ Rolled back Occasions');

    await queryInterface.bulkDelete('Colors', null, {});
    console.log('✅ Rolled back Colors');

    await queryInterface.bulkDelete('ClothingTypes', null, {});
    console.log('✅ Rolled back ClothingTypes');

    await queryInterface.bulkDelete('Brands', null, {});
    console.log('✅ Rolled back Brands');

    await queryInterface.bulkDelete('Users', null, {});
    console.log('✅ Rolled back Users');

    // Reset auto-increment sequences
    await queryInterface.sequelize.query('ALTER SEQUENCE "Users_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "Brands_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "ClothingTypes_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "Colors_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "Occasions_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "ClothingItems_id_seq" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE "ClothingItemOccasions_id_seq" RESTART WITH 1');
    console.log('✅ Reset all sequences');

    console.log('🎉 All seed data rolled back successfully!');
  }
};