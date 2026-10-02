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

    // 1. Create User 1 (board owner)
    const userA = await User.create({
      name: "User 1",
      email: "user1@gmail.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User A: ${userA.name} (${userA.email}, ID: ${userA.id})`);

    // 2. Create User 2 (authorized viewer)
    const userB = await User.create({
      name: "User 2",
      email: "user2@gmail.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User B: ${userB.name} (${userB.email}, ID: ${userB.id})`);

    // 3. Create an unauthorized test user with no access to User 1's board
    const userC = await User.create({
      name: "Charlie Brown",
      email: "charlie@example.com",
      passwordHash: defaultPasswordHash,
    });
    console.log(`Created User C: ${userC.name} (${userC.email}, ID: ${userC.id})`);

    // 4. Create sample Todos for User A
    const todosA = await Todo.bulkCreate([
      {
        title: "Book dentist appointment",
        description: "Call the clinic and ask for an afternoon slot.",
        status: "TODO",
        priority: "HIGH",
        ownerId: userA.id,
      },
      {
        title: "Pick up groceries",
        description: "Get milk, bread, eggs, and coffee.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: userA.id,
      },
      {
        title: "Call the electrician",
        description: "Ask about the kitchen light and confirm a time.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        ownerId: userA.id,
      },
      {
        title: "Return library books",
        description: "Drop them off before the library closes.",
        status: "DONE",
        priority: "MEDIUM",
        ownerId: userA.id,
      },
      {
        title: "Pay phone bill",
        description: "Paid through the provider's app.",
        status: "DONE",
        priority: "LOW",
        ownerId: userA.id,
      },
    ]);
    console.log(`Created ${todosA.length} everyday sample tasks for User 1.`);

    // 5. Create sample Todos for User B
    const todosB = await Todo.bulkCreate([
      {
        title: "Pick up parcel",
        description: "Collect it from the post office on the way home.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: userB.id,
      },
      {
        title: "Water the plants",
        description: "The pots on the balcony need a good soak.",
        status: "TODO",
        priority: "LOW",
        ownerId: userB.id,
      },
    ]);
    console.log(`Created ${todosB.length} everyday sample tasks for User 2.`);

    // 6. Create BoardAccess allowing User B (viewer) to view User A's (owner) board
    const access = await BoardAccess.create({
      ownerId: userA.id,
      viewerId: userB.id,
      canView: true,
    });
    console.log(
      `Created BoardAccess: User 2 (${userB.email}) can view User 1 (${userA.email})'s board (ID: ${access.id}).`
    );

    console.log("\n=============================================");
    console.log("Database seeded successfully!");
    console.log("Demo Credentials:");
    console.log("---------------------------------------------");
    console.log("1. User 1 (Owner with tasks & shared board):");
    console.log("   Email:    user1@gmail.com");
    console.log("   Password: Password123!");
    console.log("2. User 2 (Authorized viewer of User 1's board):");
    console.log("   Email:    user2@gmail.com");
    console.log("   Password: Password123!");
    console.log("3. Internal test user (Unauthorized - test 403 Forbidden):");
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
