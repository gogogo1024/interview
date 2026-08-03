import * as grpc from "@grpc/grpc-js";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTraceId } from "../observability/context";
import { logger } from "../observability/logger";
import { wrapGrpcHandler } from "./wrapHandler";

describe("wrapGrpcHandler", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("adds trace metadata and appends traceId to error-shaped responses", async () => {
        const sendMetadata = vi.fn();
        const handler = {
            async getThing(..._args: unknown[]) {
                return {
                    error: "Something went wrong",
                    traceSeenByHandler: getTraceId(),
                };
            },
        };

        const wrapped = wrapGrpcHandler(handler, "TestService");
        const result = await wrapped.getThing({ sendMetadata });

        expect(result.traceSeenByHandler).toMatch(/^[-a-zA-Z0-9_]+$/);
        expect(result.error).toMatch(/^Something went wrong \(trace=.*\)$/);
        expect(sendMetadata).toHaveBeenCalledTimes(1);

        const metadataArg = sendMetadata.mock.calls[0]?.[0] as grpc.Metadata;
        expect(metadataArg.get("x-trace-id")).toHaveLength(1);
    });

    it("preserves grpc error code and appends traceId when the handler throws a typed error", async () => {
        const handler = {
            async getThing(..._args: unknown[]) {
                const error = new Error("Missing record") as Error & { code: number };
                error.code = grpc.status.NOT_FOUND;
                throw error;
            },
        };

        const wrapped = wrapGrpcHandler(handler, "TestService");

        await expect(wrapped.getThing({})).rejects.toMatchObject({
            code: grpc.status.NOT_FOUND,
        });

        await expect(wrapped.getThing({})).rejects.toThrow(/Missing record \(trace=.*\)$/);
    });

    it("maps generic errors to INTERNAL and logs the failure", async () => {
        const errorSpy = vi.spyOn(logger, "error");
        const handler = {
            async getThing(..._args: unknown[]) {
                throw new Error("Unexpected failure");
            },
        };

        const wrapped = wrapGrpcHandler(handler, "TestService");

        await expect(wrapped.getThing({})).rejects.toMatchObject({
            code: grpc.status.INTERNAL,
        });
        expect(errorSpy).toHaveBeenCalledWith(
            "grpc.request.error",
            expect.objectContaining({ method: "TestService.getThing" }),
        );
    });
});