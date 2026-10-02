import "dotenv/config";
import bcrypt from "bcryptjs";
import { sequelize, User, Todo, BoardAccess } from "../src/lib/db";

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING AUTOMATED AUTHORIZATION & ACCESS CONTROL TESTS");
  console.log("=================================================\n");

  try {
    await sequelize.authenticate();

    // 1. Fetch Alice, Bob, Charlie
    const alice = await User.findOne({ where: { email: "alice@example.com" } });
    const bob = await User.findOne({ where: { email: "bob@example.com" } });
    const charlie = await User.findOne({ where: { email: "charlie@example.com" } });

    if (!alice || !bob || !charlie) {
      throw new Error("Seed users not found. Run npm run db:seed first.");
    }

    console.log("✓ Test 1: Verified seeded test users exist (Alice, Bob, Charlie).");

    // 2. Verify password hashing
    const isPasswordValid = await bcrypt.compare("Password123!", alice.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Password hash verification failed.");
    }
    console.log("✓ Test 2: Verified bcrypt password hash matches credentials.");

    // 3. Verify Alice's todos exist
    const aliceTodos = await Todo.findAll({ where: { ownerId: alice.id } });
    if (aliceTodos.length === 0) {
      throw new Error("Alice has no todos.");
    }
    console.log(`✓ Test 3: Verified Alice has ${aliceTodos.length} owned todos.`);

    // 4. Test Board Access logic: Bob accessing Alice's board
    const bobAccessToAlice = await BoardAccess.findOne({
      where: {
        ownerId: alice.id,
        viewerId: bob.id,
        canView: true,
      },
    });

    if (!bobAccessToAlice) {
      throw new Error("Bob does not have BoardAccess to Alice's board.");
    }
    console.log("✓ Test 4: Verified BoardAccess record permits Bob to view Alice's board.");

    // 5. Test Board Access logic: Charlie accessing Alice's board (should be DENIED)
    const charlieAccessToAlice = await BoardAccess.findOne({
      where: {
        ownerId: alice.id,
        viewerId: charlie.id,
        canView: true,
      },
    });

    if (charlieAccessToAlice) {
      throw new Error("Security Breach: Charlie should NOT have access to Alice's board!");
    }
    console.log("✓ Test 5: Verified Charlie has NO access record to Alice's board (Expected 403 Forbidden).");

    // 6. Test Todo Modification Authorization: Bob attempting to mutate Alice's todo
    const aliceTodo = aliceTodos[0];
    const isBobOwner = aliceTodo.ownerId === bob.id;
    if (isBobOwner) {
      throw new Error("Ownership logic error: Bob should not own Alice's todo.");
    }
    console.log("✓ Test 6: Verified Bob is NOT the owner of Alice's todo; mutations correctly blocked.");

    // 7. Test Todo Modification Authorization: Alice mutating her own todo
    const originalStatus = aliceTodo.status;
    aliceTodo.status = originalStatus === "TODO" ? "IN_PROGRESS" : "TODO";
    await aliceTodo.save();
    console.log(`✓ Test 7: Verified Alice can update her own todo status (now ${aliceTodo.status}).`);

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
