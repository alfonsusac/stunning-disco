export class Cleaner {
  private cleanups: (() => void)[] = [];
  constructor() { }
  set add(fn: () => void) {
    this.cleanups.push(fn);
  }
  clean() {
    this.cleanups.forEach(cleanup => cleanup());
  }
}