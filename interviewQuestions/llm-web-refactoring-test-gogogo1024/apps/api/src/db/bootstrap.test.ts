import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as schema from "@chirp/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import { initializeDatabase } from "./bootstrap";

const { users, posts, follows } = schema;

describe("initializeDatabase", () => {
	const tempDirs: string[] = [];

	afterEach(async () => {
		await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
	});

	it("creates the schema and seeds the full demo dataset for a fresh database file", async () => {
		const tempDir = await mkdtemp(path.join(tmpdir(), "chirp-bootstrap-"));
		tempDirs.push(tempDir);
		const dbPath = path.join(tempDir, "chirp.db");
		const databaseUrl = `file:${dbPath}`;

		const { db } = await initializeDatabase(databaseUrl);

		const alice = await db.select().from(users).where(eq(users.email, "alice@test.com")).get();
		const seedPost = await db.select().from(posts).where(eq(posts.id, "seed-post-1")).get();
		const seedFollow = await db.select().from(follows).where(eq(follows.id, "seed-follow-1")).get();

		expect(alice).toBeDefined();
		expect(alice?.username).toBe("alice");
		expect(seedPost?.content).toContain("full-stack app with gRPC");
		expect(seedFollow).toBeDefined();
	});
});
