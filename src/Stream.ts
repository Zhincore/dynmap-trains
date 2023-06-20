import { APIResponse } from "./types/APITypes";

type Listener<T> = (data: T) => void;

export class Stream<T extends APIResponse = APIResponse> {
  #events: EventSource | null = null;
  #listeners = new Set<Listener<T>>();

  constructor(private readonly url: string) {}

  public connect() {
    this.disconnect();

    this.#events = new EventSource(this.url);

    this.#events.onmessage = (ev) => {
      this.#onMessage(JSON.parse(ev.data));
    };

    return new Promise<void>((resolve, reject) => {
      const _end = () => {
        this.#events!.removeEventListener("open", _resolve);
        this.#events!.removeEventListener("error", _reject);
        return true;
      };
      const _resolve = () => _end() && resolve();
      const _reject = () => _end() && reject();

      this.#events!.addEventListener("open", _resolve, { once: true });
      this.#events!.addEventListener("error", _reject, { once: true });
    });
  }

  public disconnect() {
    if (this.#events && this.#events.readyState != this.#events.CLOSED) {
      this.#events.close();
    }
    this.#events = null;
  }

  #onMessage(data: T) {
    for (const callback of this.#listeners) callback(data);
  }

  onMessage(callback: Listener<T>) {
    return this.#listeners.add(callback);
  }

  off(callback: Listener<T>) {
    return this.#listeners.delete(callback);
  }
}
