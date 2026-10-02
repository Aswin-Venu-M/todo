import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function loginUser(email: string, password = "Password123!") {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed for ${email}: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const setCookie = res.headers.get("set-cookie");
  let cookieHeader = "";
  if (setCookie) {
    // Extract auth_token value
    const match = setCookie.match(/auth_token=([^;]+)/);
    if (match) {
      cookieHeader = `auth_token=${match[1]}`;
    }
  }

  return { user: data.user, cookieHeader };
}

async function runEndToEndHttpTests() {
  console.log("==========================================================");
  console.log("RUNNING LIVE END-TO-END HTTP TESTS ON http://localhost:3000");
  console.log("==========================================================\n");

  try {
    // Step 1: Unauthenticated request to protected API
    console.log("1. Testing unauthenticated access to /api/todos...");
    const unauthRes = await fetch(`${BASE_URL}/api/todos`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log("   ✓ Blocked with 401 Unauthorized as expected.\n");

    // Step 2: Log in as User 1 (Owner)
    console.log("2. Logging in as User 1 (user1@gmail.com)...");
    const aliceSession = await loginUser("user1@gmail.com");
    console.log(`   ✓ Logged in as ${aliceSession.user.name} (ID: ${aliceSession.user.id})`);

    // Step 3: Fetch User 1's todos
    console.log("3. Fetching User 1's personal board todos via /api/todos...");
    const aliceTodosRes = await fetch(`${BASE_URL}/api/todos`, {
      headers: { Cookie: aliceSession.cookieHeader },
    });
    const aliceTodosData = await aliceTodosRes.json();
    console.log(`   ✓ User 1 retrieved ${aliceTodosData.todos.length} owned todos.`);

    // Step 4: User 1 creates a new task
    console.log("4. User 1 creating a new task...");
    const createRes = await fetch(`${BASE_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: aliceSession.cookieHeader,
      },
      body: JSON.stringify({
        title: "Test Automated End-to-End Task",
        description: "Created via automated HTTP validation suite",
        status: "TODO",
        priority: "HIGH",
      }),
    });
    const createdData = await createRes.json();
    if (createRes.status !== 201) {
      throw new Error(`Create failed: ${JSON.stringify(createdData)}`);
    }
    const createdTodo = createdData.todo;
    console.log(`   ✓ Created task: "${createdTodo.title}" (ID: ${createdTodo.id})`);

    // Step 5: User 1 moves task to IN_PROGRESS
    console.log("5. User 1 shifting task status to IN_PROGRESS...");
    const patchRes = await fetch(`${BASE_URL}/api/todos/${createdTodo.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: aliceSession.cookieHeader,
      },
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok || patchData.todo.status !== "IN_PROGRESS") {
      throw new Error(`Status update failed: ${JSON.stringify(patchData)}`);
    }
    console.log(`   ✓ Status successfully shifted to ${patchData.todo.status}.`);

    // Step 6: Log in as User 2 (Authorized Viewer)
    console.log("\n6. Logging in as User 2 (user2@gmail.com)...");
    const bobSession = await loginUser("user2@gmail.com");
    console.log(`   ✓ Logged in as ${bobSession.user.name} (ID: ${bobSession.user.id})`);

    // Step 7: User 2 checks shared boards list
    console.log("7. User 2 checking /api/boards/shared...");
    const bobSharedRes = await fetch(`${BASE_URL}/api/boards/shared`, {
      headers: { Cookie: bobSession.cookieHeader },
    });
    const bobSharedData = await bobSharedRes.json();
    const aliceBoardInBobList = bobSharedData.sharedBoards.find(
      (b: { ownerId: string }) => b.ownerId === aliceSession.user.id
    );
    if (!aliceBoardInBobList) {
      throw new Error("User 1's board was not found in User 2's shared boards list!");
    }
    console.log(`   ✓ Found User 1's board in User 2's shared list (${aliceBoardInBobList.todoCount} tasks).`);

    // Step 8: User 2 accesses User 1's board
    console.log(`8. User 2 accessing User 1's board (/api/boards/${aliceSession.user.id}/todos)...`);
    const bobAccessAliceRes = await fetch(
      `${BASE_URL}/api/boards/${aliceSession.user.id}/todos`,
      {
        headers: { Cookie: bobSession.cookieHeader },
      }
    );
    const bobAccessAliceData = await bobAccessAliceRes.json();
    if (!bobAccessAliceRes.ok || !bobAccessAliceData.canView) {
      throw new Error(`User 2 was denied access: ${JSON.stringify(bobAccessAliceData)}`);
    }
    console.log(`   ✓ User 2 successfully retrieved User 1's board! (isOwner: ${bobAccessAliceData.isOwner}, canView: ${bobAccessAliceData.canView}, task count: ${bobAccessAliceData.todos.length})`);

    // Step 9: User 2 tries to EDIT User 1's task (Security check: Must be 403 Forbidden)
    console.log("9. Security test: User 2 attempting to MODIFY User 1's task...");
    const bobEditRes = await fetch(`${BASE_URL}/api/todos/${createdTodo.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: bobSession.cookieHeader,
      },
      body: JSON.stringify({ title: "Unauthorized edit" }),
    });
    if (bobEditRes.status !== 403) {
      throw new Error(`SECURITY BREACH: User 2 was able to modify User 1's task! Status: ${bobEditRes.status}`);
    }
    console.log("   ✓ Successfully blocked with 403 Forbidden (Viewer is strictly read-only).");

    // Step 10: User 2 tries to DELETE User 1's task (Security check: Must be 403 Forbidden)
    console.log("10. Security test: User 2 attempting to DELETE User 1's task...");
    const bobDeleteRes = await fetch(`${BASE_URL}/api/todos/${createdTodo.id}`, {
      method: "DELETE",
      headers: { Cookie: bobSession.cookieHeader },
    });
    if (bobDeleteRes.status !== 403) {
      throw new Error(`SECURITY BREACH: User 2 was able to delete User 1's task! Status: ${bobDeleteRes.status}`);
    }
    console.log("   ✓ Successfully blocked with 403 Forbidden.");

    // Step 11: Log in as Charlie (Unauthorized User)
    console.log("\n11. Logging in as Charlie (charlie@example.com)...");
    const charlieSession = await loginUser("charlie@example.com");
    console.log(`   ✓ Logged in as ${charlieSession.user.name} (ID: ${charlieSession.user.id})`);

    // Step 12: The unauthorized test user tries to access User 1's board (Security check: Must be 403 Forbidden)
    console.log(`12. Security test: unauthorized test user attempting to VIEW User 1's board (/api/boards/${aliceSession.user.id}/todos)...`);
    const charlieAccessRes = await fetch(
      `${BASE_URL}/api/boards/${aliceSession.user.id}/todos`,
      {
        headers: { Cookie: charlieSession.cookieHeader },
      }
    );
    if (charlieAccessRes.status !== 403) {
      throw new Error(`SECURITY BREACH: unauthorized test user was able to view User 1's board! Status: ${charlieAccessRes.status}`);
    }
    console.log("   ✓ Successfully blocked with 403 Forbidden (No BoardAccess record exists).");

    // Step 13: Clean up test task
    console.log("\n13. User 1 deleting the automated test task...");
    const cleanupRes = await fetch(`${BASE_URL}/api/todos/${createdTodo.id}`, {
      method: "DELETE",
      headers: { Cookie: aliceSession.cookieHeader },
    });
    if (!cleanupRes.ok) {
      throw new Error("Failed to clean up test task");
    }
    console.log("   ✓ Task deleted cleanly.");

    console.log("\n==========================================================");
    console.log("ALL 13 LIVE HTTP INTEGRATION & SECURITY TESTS PASSED! 🎉");
    console.log("==========================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("HTTP E2E Test Failure:", error);
    process.exit(1);
  }
}

runEndToEndHttpTests();
