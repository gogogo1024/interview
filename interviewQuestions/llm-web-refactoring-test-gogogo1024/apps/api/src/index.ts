import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { startGrpcServer } from "./grpc/server";

const GRPC_PORT = Number(process.env.GRPC_PORT) || 50051;
const HTTP_PORT = Number(process.env.HTTP_PORT) || 3001;

// Start gRPC server first — health check must not report ok until gRPC is ready
const grpcServer = await startGrpcServer(GRPC_PORT);

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
