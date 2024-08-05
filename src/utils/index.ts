import { IConfig } from "../types/IConfig";

export * from "./Vector";

export type Unarray<T> = T extends readonly (infer P)[] ? P : T;

export function getMapForDimension(dimension: string, dynmap: DynMap, config: IConfig) {
  const worldName = Object.entries(config.worlds).find(([_, v]) => v == dimension)?.[0];
  if (worldName && Reflect.has(dynmap.worlds, worldName)) {
    const world = dynmap.worlds[worldName];
    return world.maps[dynmap.maptype.options.name] ?? world.maps[Object.keys(world.maps)[0]];
  } else {
    return null
  }
}
