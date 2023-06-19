import { TrainObject } from "./APITypes";
import { IConfig } from "./IConfig";

export abstract class Renderer<T extends TrainObject = TrainObject, R extends L.Layer = L.Layer> {
  constructor(protected readonly dynmap: DynMap, protected readonly config: IConfig) {}

  public abstract render(data: T): R;
  public abstract update(data: T, object: R): void;
}
