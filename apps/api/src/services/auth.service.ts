import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { type AuthContext, createSessionToken } from "../middleware/auth";
import { generateId, hashPassword, verifyPassword } from "./utils";

const { users } = schema;

export interface RegisterInput {
	email: string;
	username: string;
	displayName: string;
	password: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export async function registerUser(input: RegisterInput) {
	// Check if email already exists
	const existingEmail = await db.select().from(users).where(eq(users.email, input.email)).get();

	if (existingEmail) {
		throw new Error("User with this email already exists");
	}

	// Check if username already exists
	const existingUsername = await db
		.select()
		.from(users)
		.where(eq(users.username, input.username))
		.get();

	if (existingUsername) {
		throw new Error("Username already taken");
	}

	// Hash password
	const passwordHash = await hashPassword(input.password);

	// Create user
	const userId = generateId();
	await db.insert(users).values({
		id: userId,
		email: input.email,
		username: input.username,
		displayName: input.displayName,
		passwordHash,
		role: "user",
	});

	// Create session token
	const sessionToken = createSessionToken({
		userId,
		username: input.username,
		role: "user",
	});

	return { userId, sessionToken };
}

export async function loginUser(input: LoginInput) {
	// Find user by email
	const user = await db.select().from(users).where(eq(users.email, input.email)).get();

	if (!user) {
		throw new Error("Invalid email or password");
	}

	// Check if user is banned
	if (user.bannedAt) {
		throw new Error(`Account banned: ${user.bannedReason || "No reason provided"}`);
	}

	// Verify password
	const valid = await verifyPassword(input.password, user.passwordHash);
	if (!valid) {
		throw new Error("Invalid email or password");
	}

	// Create session token
	const sessionToken = createSessionToken({
		userId: user.id,
		username: user.username,
		role: user.role as AuthContext["role"],
	});

	return { userId: user.id, sessionToken };
}

export async function getCurrentUser(userId: string) {
	const user = await db
		.select({
			id: users.id,
			email: users.email,
			username: users.username,
			displayName: users.displayName,
			avatarUrl: users.avatarUrl,
			bio: users.bio,
			role: users.role,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.id, userId))
		.get();

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}
