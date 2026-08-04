import * as schema from "@chirp/db-schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedDatabase } from "./seed-data";

export async function initializeDatabase(
	databaseUrl = process.env.DATABASE_URL || "file:./chirp.db",
	client = createClient({ url: databaseUrl }),
	db = drizzle(client, { schema }),
) {
	await migrate(db, {
		migrationsFolder: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../db/migrations"),
	});

	await seedDatabase(db);

	return { client, db };
}
