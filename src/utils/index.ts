export * from "./Vector";

export type Unarray<T> = T extends readonly (infer P)[] ? P : T;
