import { beforeEach, vi } from "vitest";

// Mock the database module before any imports
vi.mock("../src/db", async () => {
	const { drizzle } = await import("drizzle-orm/libsql");
	const { createClient } = await import("@libsql/client");
	const schema = await import("@chirp/db-schema");

	// Create a unique in-memory database for each test file
	const client = createClient({
		url: ":memory:",
	});

	const db = drizzle(client, { schema });

	// Create tables
	await client.execute(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			username TEXT NOT NULL UNIQUE,
			display_name TEXT NOT NULL,
			avatar_url TEXT,
			bio TEXT,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'user',
			banned_at INTEGER,
			banned_reason TEXT,
			banned_by TEXT,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS posts (
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
			author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS likes (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
			comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			UNIQUE(user_id, post_id),
			UNIQUE(user_id, comment_id)
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS follows (
			id TEXT PRIMARY KEY,
			follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			UNIQUE(follower_id, following_id)
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS bookmarks (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			UNIQUE(user_id, post_id)
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			type TEXT NOT NULL,
			actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
			comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
			read INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS reports (
			id TEXT PRIMARY KEY,
			reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			target_type TEXT NOT NULL,
			target_id TEXT NOT NULL,
			reason TEXT NOT NULL,
			description TEXT,
			status TEXT NOT NULL DEFAULT 'pending',
			reviewed_by TEXT REFERENCES users(id),
			reviewed_at INTEGER,
			created_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS audit_logs (
			id TEXT PRIMARY KEY,
			admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			action TEXT NOT NULL,
			target_type TEXT,
			target_id TEXT,
			details TEXT,
			ip_address TEXT,
			created_at INTEGER NOT NULL DEFAULT (unixepoch())
		)
	`);

	return { db, schema, client };
});

// Clean up database before each test
beforeEach(async () => {
	const { client } = await import("../src/db");
	// Clear all tables in reverse order of dependencies
	await (client as any).execute("DELETE FROM audit_logs");
	await (client as any).execute("DELETE FROM reports");
	await (client as any).execute("DELETE FROM notifications");
	await (client as any).execute("DELETE FROM bookmarks");
	await (client as any).execute("DELETE FROM follows");
	await (client as any).execute("DELETE FROM likes");
	await (client as any).execute("DELETE FROM comments");
	await (client as any).execute("DELETE FROM posts");
	await (client as any).execute("DELETE FROM users");
});
