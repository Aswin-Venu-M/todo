import "dotenv/config";
import { sequelize } from "../src/lib/db";

async function reset() {
  console.log("Resetting database (dropping all tables)...");
  try {
    await sequelize.authenticate();
    await sequelize.drop();
    console.log("All tables dropped.");
    await sequelize.sync({ force: true });
    console.log("Tables recreated cleanly.");
    console.log("Now running seed...");
    // Import seed
    const { execSync } = await import("child_process");
    execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
    process.exit(0);
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exit(1);
  }
}

reset();
