// Minimal E2E shim for "#tanstack-start-entry"
// Provides a no-op module so esbuild dependency optimization
// doesn't fail when the real dev runtime is disabled.

export const __isE2EShim = true;
export default {};
