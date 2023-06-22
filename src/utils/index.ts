import { IConfig } from "../types/IConfig";

export * from "./Vector";

export type Unarray<T> = T extends readonly (infer P)[] ? P : T;

export function getMapForDimension(dimension: string, dynmap: DynMap, config: IConfig) {
  const worldName = Object.entries(config.worlds).find(([_, v]) => v == dimension)?.[0];
  const world = worldName ? dynmap.worlds[worldName] : null;
  return world.maps[dynmap.maptype.options.name] ?? world.maps[Object.keys(world.maps)[0]];
}
