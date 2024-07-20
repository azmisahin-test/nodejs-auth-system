const express = require("express");
require("dotenv").config();
const { testConnection, syncModels, User } = require("./sequelize");
const {
  setPermissions,
  getPermissions,
  setUserIdByUsername,
} = require("./cache");
const createLogger = require("./logger");
const logger = createLogger("SVR");

const app = express();
app.use(express.json());
app.use(express.static("public")); // Serve static files from the "public" directory

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
    await setUserIdByUsername(username, user.id);
    await setPermissions(username, permissions);
    res.status(201).json(user);
  } catch (err) {
    logger.error("Error creating user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put("/users/:username/permissions", async (req, res) => {
  const username = req.params.username;
  const { permissions } = req.body;
  logger.info(
    `PUT /users/${username}/permissions - Updating permissions to: ${JSON.stringify(
      permissions
    )}`
  );
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      await User.update({ permissions }, { where: { username } });
      logger.info(`Permissions updated for user: ${username}`);
      await setPermissions(username, permissions);
      res.status(200).json({ message: "Permissions updated" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    logger.error("Error updating permissions:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/users/:username/permissions", async (req, res) => {
  const username = req.params.username;
  logger.info(`GET /users/${username}/permissions - Retrieving permissions`);
  try {
    let permissions = await getPermissions(username);
    if (!permissions) {
      logger.info("Cache miss - fetching from database");
      const user = await User.findOne({ where: { username } });
      permissions = user ? user.permissions : null;
      if (permissions) {
        logger.info("Caching permissions");
        await setPermissions(username, permissions);
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
