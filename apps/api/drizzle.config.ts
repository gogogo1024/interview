import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "../../packages/db-schema/src/schema.ts",
	out: "../../db/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DATABASE_URL || "./chirp.db",
	},
});
