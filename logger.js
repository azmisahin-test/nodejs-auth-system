const winston = require("winston");
require("dotenv").config();
const fs = require("fs");

// Log dizinini oluşturun (varsa) veya oluşturun
const logDirectory = process.env.LOG_DIR || "/logs";
const filename = process.env.LOG_FILE || "combined.log";
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Logger konfigürasyonu
const createLogger = (moduleName) => {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level.toUpperCase()} [${moduleName}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `${logDirectory}/${filename}` }),
    ],
  });

  return logger;
};

module.exports = createLogger;
