export type CircuitState = "closed" | "open" | "half-open";

export class CircuitBreaker {
  state: CircuitState = "closed";
  failures = 0;
  openedAt = 0;

  constructor(
    readonly name: string,
    readonly threshold = 3,
    readonly resetMs = 10_000,
  ) {}

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.openedAt < this.resetMs) {
        const err = new Error(`circuit-open:${this.name}`);
        (err as Error & { circuit: CircuitState }).circuit = this.state;
        throw err;
      }
      this.state = "half-open";
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = "closed";
      return result;
    } catch (e) {
      this.failures += 1;
      if (this.state === "half-open" || this.failures >= this.threshold) {
        this.state = "open";
        this.openedAt = Date.now();
      }
      throw e;
    }
  }

  snapshot() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
    };
  }
}
