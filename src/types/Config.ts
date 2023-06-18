export interface Config {
  baseUrl: string;
  worlds: Record<string, string>;
  label: string;
  trainWidth: number;
}

export type InputConfig = Partial<
  Omit<Config, "baseUrl" | "trainWidth"> & {
    "base-url": Config["baseUrl"];
    "train-width": Config["trainWidth"];
  }
>;
