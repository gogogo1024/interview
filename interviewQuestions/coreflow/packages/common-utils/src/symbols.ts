/**
 * Global registry symbols for server instances and state management
 * Centralized Symbol definitions to avoid string magic and ensure consistency
 */

export const Symbols = {
  /**
   * Symbol key for storing image API server instance in globalThis
   * @example
   * const server = (globalThis as any)[Symbols.IMAGE_API_SERVER];
   */
  IMAGE_API_SERVER: Symbol.for('coreflow.image.api.server'),

  /**
   * Symbol key for storing image API server state in globalThis
   * @example
   * const state = (globalThis as any)[Symbols.IMAGE_API_STATE];
   */
  IMAGE_API_STATE: Symbol.for('coreflow.image.api.state'),
} as const;

/**
 * Type-safe registry for managing server instances across the application
 */
export interface ServerRegistry {
  [Symbols.IMAGE_API_SERVER]?: any;
  [Symbols.IMAGE_API_STATE]?: Record<string, any>;
}
