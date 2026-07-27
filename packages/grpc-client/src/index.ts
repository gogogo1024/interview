// Re-export proto types for convenience
export * from "@chirp/proto";
export type { ChirpClient, ChirpClientConfig } from "./client";
export { createChirpClient, DEFAULT_GRPC_HOST } from "./client";
