import "dotenv/config";
import bcrypt from "bcryptjs";
import { sequelize, User, Todo, BoardAccess } from "../src/lib/db";

async function seed() {
  console.log("Seeding database with demo data...");
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Sync schema first to ensure tables exist
    await sequelize.sync({ alter: true });

    // Clean existing seed data
    await BoardAccess.destroy({ where: {}, truncate: false });
    await Todo.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });

    console.log("Cleaned previous records.");

    const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

    // 1. Create User A (Alice Walker)
    const userA = await User.create({
      name: "Alice Walker",
      email: "alice@example.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User A: ${userA.name} (${userA.email}, ID: ${userA.id})`);

    // 2. Create User B (Bob Smith)
    const userB = await User.create({
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User B: ${userB.name} (${userB.email}, ID: ${userB.id})`);

    // 3. Create User C (Charlie Brown) - No board access to Alice's board
    const userC = await User.create({
      name: "Charlie Brown",
      email: "charlie@example.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User C: ${userC.name} (${userC.email}, ID: ${userC.id})`);

    // 4. Create sample Todos for User A
    const todosA = await Todo.bulkCreate([
      {
        title: "Design High-Level Architecture",
        description: "Draft Next.js App Router structure, Sequelize models, and session cookies flow.",
        status: "TODO",
        priority: "HIGH",
        ownerId: userA.id,
      },
      {
        title: "Implement Board Access Control",
        description: "Enforce read-only access for authorized viewers and strictly disallow unauthorized users.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: userA.id,
      },
      {
        title: "Build Responsive Kanban Board",
        description: "Implement 3 columns (Todo, In Progress, Done) with priority indicators and status quick-actions.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        ownerId: userA.id,
      },
      {
        title: "Configure Neon / Postgres SSL",
        description: "Ensure Sequelize handles SSL connections for Vercel deployment and local fallback seamlessly.",
        status: "DONE",
        priority: "MEDIUM",
        ownerId: userA.id,
      },
      {
        title: "Write Comprehensive Documentation",
        description: "Cover project overview, access-control design, setup instructions, and demo credentials.",
        status: "DONE",
        priority: "LOW",
        ownerId: userA.id,
      },
    ]);
    console.log(`Created ${todosA.length} sample todos for User A (Alice).`);

    // 5. Create sample Todos for User B
    const todosB = await Todo.bulkCreate([
      {
        title: "Review Alice's Shared Kanban Board",
        description: "Log in as Bob and verify read-only access to Alice's project tasks.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: userB.id,
      },
      {
        title: "Prepare Sprint Feedback",
        description: "Compile notes on board layout and performance.",
        status: "TODO",
        priority: "LOW",
        ownerId: userB.id,
      },
    ]);
    console.log(`Created ${todosB.length} sample todos for User B (Bob).`);

    // 6. Create BoardAccess allowing User B (viewer) to view User A's (owner) board
    const access = await BoardAccess.create({
      ownerId: userA.id,
      viewerId: userB.id,
      canView: true,
    });
    console.log(
      `Created BoardAccess: User B (${userB.email}) can view User A (${userA.email})'s board (ID: ${access.id}).`
    );

    console.log("\n=============================================");
    console.log("Database seeded successfully!");
    console.log("Demo Credentials:");
    console.log("---------------------------------------------");
    console.log("1. User A (Owner with tasks & shared board):");
    console.log("   Email:    alice@example.com");
    console.log("   Password: Password123!");
    console.log("2. User B (Authorized viewer of User A's board):");
    console.log("   Email:    bob@example.com");
    console.log("   Password: Password123!");
    console.log("3. User C (Unauthorized user - test 403 Forbidden):");
    console.log("   Email:    charlie@example.com");
    console.log("   Password: Password123!");
    console.log("=============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
