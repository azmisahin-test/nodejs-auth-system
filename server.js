const express = require("express");
require("dotenv").config();
const { testConnection, syncModels, User } = require("./sequelize");
const { setPermissions, getPermissions } = require("./cache");
const createLogger = require("./logger");
const logger = createLogger("SVR");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize DB connection and sync models
(async () => {
  try {
    await testConnection();
    await syncModels();
  } catch (error) {
    logger.error("Error initializing database:", error);
  }
})();

app.post("/users", async (req, res) => {
  const { username, permissions } = req.body;
  logger.info(
    `POST /users - Creating user: ${username} with permissions: ${JSON.stringify(
      permissions
    )}`
  );
  try {
    const user = await User.create({ username, permissions });
    logger.info(`User created with ID: ${user.id}`);
    await setPermissions(user.id, permissions);
    res.status(201).json(user);
  } catch (err) {
    logger.error("Error creating user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/users/:id/permissions", async (req, res) => {
  const userId = req.params.id;
  const { permissions } = req.body;
  logger.info(
    `PUT /users/${userId}/permissions - Updating permissions to: ${JSON.stringify(
      permissions
    )}`
  );
  try {
    await User.update({ permissions }, { where: { id: userId } });
    logger.info(`Permissions updated for user ID: ${userId}`);
    await setPermissions(userId, permissions);
    res.status(200).json({ message: "Permissions updated" });
  } catch (err) {
    logger.error("Error updating permissions:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:id/permissions", async (req, res) => {
  const userId = req.params.id;
  logger.info(`GET /users/${userId}/permissions - Retrieving permissions`);
  try {
    let permissions = await getPermissions(userId);
    if (!permissions) {
      logger.info("Cache miss - fetching from database");
      const user = await User.findByPk(userId);
      permissions = user ? user.permissions : null;
      if (permissions) {
        logger.info("Caching permissions");
        await setPermissions(userId, permissions);
      } else {
        logger.info("User not found");
      }
    } else {
      logger.info("Cache hit");
    }
    res.json(permissions);
  } catch (err) {
    logger.error("Error retrieving permissions:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
