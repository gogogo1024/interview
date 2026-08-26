type Item<T> = { priority: number; value: T };

export class PriorityQueue<T> {
  private items: Item<T>[] = [];

  push(value: T, priority = 0) {
    this.items.push({ value, priority });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  pop(): T | undefined {
    const it = this.items.shift();
    return it?.value;
  }

  size() {
    return this.items.length;
  }
}

export default PriorityQueue;
