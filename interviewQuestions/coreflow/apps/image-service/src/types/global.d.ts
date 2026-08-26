declare global {
  interface GlobalThis {
    [key: symbol]: {
      started?: boolean;
      server?: import('http').Server;
    } | undefined;
  }
}

export {};
