// Minimal dynamic config base class for future hot-reload implementations.
export abstract class DynamicConfig<T> {
  protected value?: T;

  abstract load(): Promise<T>;

  async start(pollMs = 0) {
    this.value = await this.load();
    if (pollMs > 0) {
      setInterval(async () => {
        try {
          this.value = await this.load();
        } catch (err) {
          // swallow errors, concrete impl should log
        }
      }, pollMs);
    }
  }

  get(): T | undefined {
    return this.value;
  }
}
