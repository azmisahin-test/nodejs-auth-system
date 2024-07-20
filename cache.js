const redis = require("redis");
require("dotenv").config();
const createLogger = require("./logger");
const logger = createLogger("CAC");

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

client.on("error", (err) => {
  logger.error("Redis error:", { error: err });
});

client.on("connect", () => {
  logger.info("Connected to Redis");
});

client.on("ready", () => {
  logger.info("Redis client ready");
});

// Ensure Redis connection is established
const connectClient = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    logger.error("Error connecting to Redis:", { error: err });
    throw err; // Ensure the error is propagated
  }
};

// Set user ID by username
const setUserIdByUsername = async (username, userId) => {
  try {
    await connectClient(); // Ensure client is connected
    await client.set(`user:${username}:id`, userId);
    logger.info("User ID set", { username, userId });
  } catch (err) {
    logger.error("Error setting user ID in Redis:", { username, error: err });
  }
};

// Get user ID by username
const getUserIdByUsername = async (username) => {
  try {
    await connectClient(); // Ensure client is connected
    const data = await client.get(`user:${username}:id`);
    logger.info("User ID retrieved", { username, userId: data });
    return data;
  } catch (err) {
    logger.error("Error getting user ID from Redis:", { username, error: err });
    throw err; // Ensure the error is propagated
  }
};

// Set user permissions in Redis
const setPermissions = async (username, permissions) => {
  try {
    await connectClient(); // Ensure client is connected
    const userId = await getUserIdByUsername(username);
    if (userId) {
      await client.set(`permissions:${userId}`, JSON.stringify(permissions));
      logger.info("Permissions set", { username, userId, permissions });
    } else {
      logger.error("User ID not found for username", { username });
    }
  } catch (err) {
    logger.error("Error setting permissions in Redis:", {
      username,
      error: err,
    });
  }
};

// Get user permissions from Redis
const getPermissions = async (username) => {
  try {
    await connectClient(); // Ensure client is connected
    const userId = await getUserIdByUsername(username);
    if (userId) {
      const data = await client.get(`permissions:${userId}`);
      const permissions = JSON.parse(data);
      logger.info("Permissions retrieved", { username, userId, permissions });
      return permissions;
    } else {
      logger.info("User ID not found for username", { username });
      return null;
    }
  } catch (err) {
    logger.error("Error getting permissions from Redis:", {
      username,
      error: err,
    });
    throw err; // Ensure the error is propagated
  }
};

module.exports = {
  setPermissions,
  getPermissions,
  setUserIdByUsername,
  getUserIdByUsername,
};
