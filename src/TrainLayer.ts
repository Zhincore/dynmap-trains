export abstract class TrainLayer<T> extends L.LayerGroup {
  #events: EventSource | null = null;

  constructor(private readonly backend_url: string, protected readonly dynmap: DynMap) {
    super();
  }

  public connect() {
    if (this.#events && this.#events.readyState != this.#events.CLOSED) {
      this.#events.close();
    }

    this.#events = new EventSource(this.backend_url);
    this.#events.onmessage = (ev) => {
      this.onUpdate(JSON.parse(ev.data));
    };
    return new Promise<void>((resolve, reject) => {
      const _end = () => {
        this.#events!.onopen = null;
        this.#events!.onerror = null;
        return true;
      };
      const _resolve = () => _end() && resolve();
      const _reject = () => _end() && reject();

      this.#events!.onopen = _resolve;
      this.#events!.onerror = _reject;
    });
  }

  protected abstract onUpdate(data: T): void;
}
