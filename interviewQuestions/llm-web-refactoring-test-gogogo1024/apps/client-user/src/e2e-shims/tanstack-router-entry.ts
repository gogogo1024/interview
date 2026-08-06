// Minimal E2E shim for "#tanstack-router-entry"
// This file provides a harmless module so dependency optimization
// and runtime imports succeed when the dev-server injection is disabled.

export const __isE2EShim = true;
export default {};
