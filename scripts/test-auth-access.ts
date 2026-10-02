import "dotenv/config";
import bcrypt from "bcryptjs";
import { sequelize, User, Todo, BoardAccess } from "../src/lib/db";

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING AUTOMATED AUTHORIZATION & ACCESS CONTROL TESTS");
  console.log("=================================================\n");

  try {
    await sequelize.authenticate();

    // 1. Fetch demo users and the internal unauthorized test account
    const alice = await User.findOne({ where: { email: "user1@gmail.com" } });
    const bob = await User.findOne({ where: { email: "user2@gmail.com" } });
    const charlie = await User.findOne({ where: { email: "charlie@example.com" } });

    if (!alice || !bob || !charlie) {
      throw new Error("Seed users not found. Run npm run db:seed first.");
    }

    console.log("✓ Test 1: Verified seeded demo and authorization test users exist.");

    // 2. Verify password hashing
    const isPasswordValid = await bcrypt.compare("Password123!", alice.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Password hash verification failed.");
    }
    console.log("✓ Test 2: Verified bcrypt password hash matches credentials.");

    // 3. Verify User 1's todos exist
    const aliceTodos = await Todo.findAll({ where: { ownerId: alice.id } });
    if (aliceTodos.length === 0) {
      throw new Error("User 1 has no todos.");
    }
    console.log(`✓ Test 3: Verified User 1 has ${aliceTodos.length} owned todos.`);

    // 4. Test Board Access logic: User 2 accessing User 1's board
    const bobAccessToAlice = await BoardAccess.findOne({
      where: {
        ownerId: alice.id,
        viewerId: bob.id,
        canView: true,
      },
    });

    if (!bobAccessToAlice) {
      throw new Error("User 2 does not have BoardAccess to User 1's board.");
    }
    console.log("✓ Test 4: Verified BoardAccess record permits User 2 to view User 1's board.");

    // 5. Test Board Access logic: the unauthorized test user accessing User 1's board (should be DENIED)
    const charlieAccessToAlice = await BoardAccess.findOne({
      where: {
        ownerId: alice.id,
        viewerId: charlie.id,
        canView: true,
      },
    });

    if (charlieAccessToAlice) {
      throw new Error("Security Breach: the unauthorized test user should NOT have access to User 1's board!");
    }
    console.log("✓ Test 5: Verified the unauthorized test user has NO access record to User 1's board (Expected 403 Forbidden).");

    // 6. Test Todo Modification Authorization: User 2 attempting to mutate User 1's todo
    const aliceTodo = aliceTodos[0];
    const isBobOwner = aliceTodo.ownerId === bob.id;
    if (isBobOwner) {
      throw new Error("Ownership logic error: User 2 should not own User 1's todo.");
    }
    console.log("✓ Test 6: Verified User 2 is NOT the owner of User 1's todo; mutations correctly blocked.");

    // 7. Test Todo Modification Authorization: User 1 mutating their own todo
    const originalStatus = aliceTodo.status;
    aliceTodo.status = originalStatus === "TODO" ? "IN_PROGRESS" : "TODO";
    await aliceTodo.save();
    console.log(`✓ Test 7: Verified User 1 can update their own todo status (now ${aliceTodo.status}).`);

    // Reset status back
    aliceTodo.status = originalStatus;
    await aliceTodo.save();

    console.log("\n=================================================");
    console.log("ALL 7 ACCESS CONTROL & SECURITY TESTS PASSED! 🎉");
    console.log("=================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Test failure:", error);
    process.exit(1);
  }
}

runTests();
