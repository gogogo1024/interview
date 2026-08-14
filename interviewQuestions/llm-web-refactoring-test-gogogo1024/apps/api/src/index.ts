import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { startGrpcServer } from "./grpc/server";

const GRPC_PORT = Number(process.env.GRPC_PORT) || 50051;
const HTTP_PORT = Number(process.env.HTTP_PORT) || 3001;

function readEnv(): NodeJS.ProcessEnv | undefined {
	try {
		// use bracket access to avoid bundlers inlining `process.env`
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p: any = typeof process !== 'undefined' ? process : undefined;
		return p && p['env'] ? p['env'] : undefined;
	} catch {
		return undefined;
	}
}

function 
isGrpcSecureAtRuntime(): boolean {
	const env = readEnv();
	if (env && env['GRPC_API_SECURE'] !== undefined) {
		return env['GRPC_API_SECURE'] === 'true';
	}
	if (env && env['NODE_ENV']) {
		return env['NODE_ENV'] === 'production';
	}
	return false;
}

// Start gRPC server first — health check must not report ok until gRPC is ready
const grpcServer = await startGrpcServer(GRPC_PORT);

// Print runtime flags to aid debugging of secure/insecure mismatches
console.log('[runtime] GRPC_API_SECURE=', readEnv()?.GRPC_API_SECURE);
console.log('[runtime] NODE_ENV=', readEnv()?.NODE_ENV);
console.log('[runtime] isGrpcSecureAtRuntime=', isGrpcSecureAtRuntime());
console.log('[runtime] GRPC_PORT=', GRPC_PORT);

// Start Elysia HTTP server for health checks (only after gRPC is bound)
const app = new Elysia({ adapter: node() })
	.get("/health", () => ({ status: "ok", grpc: `localhost:${GRPC_PORT}` }))
	.get("/", () => ({
		name: "Chirp API",
		version: "1.0.0",
		grpcPort: GRPC_PORT,
		httpPort: HTTP_PORT,
	}))
	.listen(HTTP_PORT);

console.log(`🚀 Chirp API started`);
console.log(`   HTTP server: http://localhost:${HTTP_PORT}`);
console.log(`   gRPC server: localhost:${GRPC_PORT}`);

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("Shutting down...");
	grpcServer.forceShutdown();
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("Shutting down...");
	grpcServer.forceShutdown();
	process.exit(0);
});

export { app, grpcServer };
