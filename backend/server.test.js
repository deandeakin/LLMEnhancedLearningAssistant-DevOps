import { test, before, after } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";

let server;

const baseUrl = "http://localhost:3100";

before(async () => {
    server = spawn("node", ["server.js"], {
        env: {
            ...process.env,
            PORT: "3100",
            GEMINI_API_KEY: "test-key"
        }
    });

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Backend did not start in time."));
        }, 5000);

        server.stdout.on("data", (data) => {
            if (data.toString().includes("Server running")) {
                clearTimeout(timeout);
                resolve();
            }
        });

        server.on("error", reject);
    });
});

after(() => {
    if (server) {
        server.kill();
    }
});

test("health endpoint returns status ok", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(body.status, "ok");
});

test("generate-task rejects request without username", async () => {
    const response = await fetch(`${baseUrl}/generate-task`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({})
    });

    const body = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(body.error, "Username is required.");
});