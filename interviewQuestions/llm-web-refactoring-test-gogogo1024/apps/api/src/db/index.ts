import { initializeDatabase } from "./bootstrap";

const { client, db } = await initializeDatabase(process.env.DATABASE_URL || "file:./chirp.db");

export { client, db };
export * as schema from "@chirp/db-schema";
export type { DbClient } from "./types";
