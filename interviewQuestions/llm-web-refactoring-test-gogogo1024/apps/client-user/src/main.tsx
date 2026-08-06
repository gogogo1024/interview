import React from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { hydrateStart } from "@tanstack/react-start/client";

async function main() {
  try {
    // Use the TanStack start hydrate helper which prepares the
    // router for client-side hydration (handles SSR buffer, adapters,
    // and route chunk loading). It returns the router instance we
    // should render with the RouterProvider.
    const router = await hydrateStart();

    // Hydrate the server-rendered content with the router provider.
    hydrateRoot(document.body, <RouterProvider router={router} /> as any);
  } catch (err) {
    // Keep errors visible in the browser console for diagnostics
    // (Playwright will capture console output).
    // eslint-disable-next-line no-console
    console.error("Client bootstrap failed:", err);
  }
}

void main();
