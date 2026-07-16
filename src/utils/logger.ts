import winston from "winston";
import path from "path";

// Tentukan folder penyimpanan file log
const logDirectory = path.join(process.cwd(), "logs");

// Tentukan format log di konsol (gaya lokal/dev: berwarna dan mudah dibaca)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// Tentukan format log di file (gaya production: JSON terstruktur)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports: winston.transport[] = [];

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  // Di production / Vercel, cukup log ke Console karena filesystem bersifat read-only
  transports.push(
    new winston.transports.Console({
      format: prodFormat,
    }),
  );
} else {
  // Di local development, log ke Console (berwarna) dan ke File
  transports.push(
    new winston.transports.Console({
      format: devFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});

export default logger;
