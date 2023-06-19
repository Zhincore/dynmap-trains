export interface IConfig {
  baseUrl: string;
  worlds: Record<string, string>;
  label: string;
  trainWidth: number;
  hidden: boolean;
}

export type InputConfig = Partial<
  Omit<IConfig, "baseUrl" | "trainWidth"> & {
    "base-url": IConfig["baseUrl"];
    "train-width": IConfig["trainWidth"];
  }
>;
