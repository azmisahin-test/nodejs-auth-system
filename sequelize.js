const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
const createLogger = require("./logger");
const logger = createLogger("ORM");

// Sequelize instance
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // logging: logger.info.bind(logger) // Winston ile loglama
  logging: false, // SQL sorgularını loglamayı kapatır
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
};

// Define User model
const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

// Sync models
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    logger.info("Database & tables updated!");
  } catch (error) {
    logger.error("Error syncing models:", error);
  }
};

module.exports = { sequelize, testConnection, syncModels, User };
