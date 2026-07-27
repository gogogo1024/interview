{
	"name": "@chirp/api",
	"version": "1.0.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "tsx watch src/index.ts",
		"build": "tsc",
		"start": "tsx src/index.ts",
		"typecheck": "tsc --noEmit",
		"test": "vitest run",
		"test:watch": "vitest",
		"db:generate": "drizzle-kit generate",
		"db:migrate": "drizzle-kit migrate",
		"db:studio": "drizzle-kit studio",
		"db:seed": "tsx src/db/seed.ts"
	},
	"dependencies": {
		"@chirp/db-schema": "workspace:*",
		"@chirp/proto": "workspace:*",
		"@chirp/shared-types": "workspace:*",
		"@grpc/grpc-js": "^1.12.6",
		"@libsql/client": "^0.17.0",
		"@protobuf-ts/grpc-backend": "^2.9.4",
		"@protobuf-ts/runtime": "^2.9.4",
		"@protobuf-ts/runtime-rpc": "^2.9.4",
		"drizzle-orm": "^0.45.1",
		"elysia": "^1.2.25",
		"@elysiajs/node": "^1.2.25",
		"jsonwebtoken": "^9.0.2"
	},
	"devDependencies": {
		"@types/jsonwebtoken": "^9.0.9",
		"@types/node": "^22.10.2",
		"drizzle-kit": "^0.31.8",
		"tsx": "^4.21.0",
		"typescript": "^5.7.2",
		"vitest": "^3.0.5"
	}
}
