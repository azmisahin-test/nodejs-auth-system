const { Pool } = require("pg");
require("dotenv").config();
const createLogger = require("./logger");
const logger = createLogger("DBS");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const initDB = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        permissions JSONB NOT NULL
      );
    `;
    await pool.query(createTableQuery);
    logger.info("Database initialized and table created");
  } catch (err) {
    logger.error("Error initializing database:", { error: err });
  }
};

module.exports = { pool, initDB };
