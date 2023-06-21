export * from "./Vector";

export type Unarray<T extends readonly unknown[]> = T extends readonly (infer P)[] ? P : never;
