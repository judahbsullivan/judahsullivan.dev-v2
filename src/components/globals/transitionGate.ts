let pendingCount = 0;
let resolvers: Array<() => void> = [];

export function beginGate(): void {
  pendingCount += 1;
}

export function resolveGate(): void {
  pendingCount = Math.max(0, pendingCount - 1);
  if (pendingCount === 0) {
    resolvers.forEach((r) => r());
    resolvers = [];
  }
}

export function waitForGate(timeoutMs = 2000): Promise<void> {
  if (pendingCount === 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, timeoutMs);
    const resolver = () => {
      clearTimeout(timeout);
      resolve();
    };
    resolvers.push(resolver);
  });
}


