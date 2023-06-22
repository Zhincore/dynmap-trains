import { IConfig } from "./IConfig";

export abstract class Renderer<T = Record<string, unknown>, R extends L.Layer = L.Layer> {
  constructor(protected readonly dynmap: DynMap, protected readonly config: IConfig) {}

  public abstract render(data: T): R | undefined;
  public abstract update(data: T, object: R): void;
}
