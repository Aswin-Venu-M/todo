import { Sequelize, type Options } from "sequelize";
import * as pg from "pg";
import { initModels, User, Todo, BoardAccess } from "./models";

declare global {
  // eslint-disable-next-line no-var
  var __sequelizeInstance: Sequelize | undefined;
}

function createSequelizeInstance(): Sequelize {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  const isProduction = process.env.NODE_ENV === "production";
  const forceSsl = process.env.DB_SSL === "true" || !!(databaseUrl && databaseUrl.includes("sslmode=require"));

  const dialectOptions: Record<string, unknown> = {};

  if (isProduction || forceSsl || (databaseUrl && !databaseUrl.includes("localhost"))) {
    dialectOptions.ssl = {
      require: true,
      rejectUnauthorized: false,
    };
  }

  const baseConfig: Options = {
    dialect: "postgres",
    dialectModule: pg,
    logging: process.env.NODE_ENV === "development" && process.env.DEBUG_SQL === "true" ? console.log : false,
    dialectOptions,
    pool: {
      max: isProduction ? 5 : 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  if (databaseUrl) {
    return new Sequelize(databaseUrl, baseConfig);
  }

  return new Sequelize({
    ...baseConfig,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "todo_db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "password",
  });
}

// Singleton pattern to prevent connection exhaustion in serverless / dev hot-reload
export const sequelize = globalThis.__sequelizeInstance ?? createSequelizeInstance();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sequelizeInstance = sequelize;
}

// Initialize models immediately on import
initModels(sequelize);

export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error("Database connection failure:", error);
    return false;
  }
}

export { User, Todo, BoardAccess };
export default sequelize;
