import "dotenv/config";
import { sequelize } from "../src/lib/db";

async function migrate() {
  console.log("Starting database migration...");
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync all models (User, Todo, BoardAccess)
    // using alter: true so existing columns/tables are safely synced
    await sequelize.sync({ alter: true });
    console.log("Migration completed successfully! All tables are up to date.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
