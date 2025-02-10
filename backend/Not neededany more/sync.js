const sequelize = require('../config/database');
const User = require('./User');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } to recreate tables
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();
