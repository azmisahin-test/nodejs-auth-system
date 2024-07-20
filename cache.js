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

const setPermissions = async (userId, permissions) => {
  try {
    await connectClient(); // Ensure client is connected
    await client.set(`permissions:${userId}`, JSON.stringify(permissions));
    logger.info("Permissions set", { userId, permissions });
  } catch (err) {
    logger.error("Error setting permissions in Redis:", { userId, error: err });
  }
};

const getPermissions = async (userId) => {
  try {
    await connectClient(); // Ensure client is connected
    const data = await client.get(`permissions:${userId}`);
    const permissions = JSON.parse(data);
    logger.info("Permissions retrieved", { userId, permissions });
    return permissions;
  } catch (err) {
    logger.error("Error getting permissions from Redis:", {
      userId,
      error: err,
    });
    throw err; // Ensure the error is propagated
  }
};

module.exports = { setPermissions, getPermissions };
