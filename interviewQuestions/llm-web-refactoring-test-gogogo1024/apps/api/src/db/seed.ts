import { db } from "./index";
import { seedDatabase } from "./seed-data";

async function seed() {
	console.log("Seeding database...");
	await seedDatabase(db);

	console.log("Database seeded successfully!");
}

await seed();
