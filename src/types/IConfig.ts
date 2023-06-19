export interface IConfig {
  hidden: boolean;
  baseUrl: string;
  worlds: Record<string, string>;
  label: string;
  trainWidth: number;
  lineWidth: number;
  lineShadow: number;
}

export type InputConfig = Partial<
  Omit<IConfig, "baseUrl" | "trainWidth"> & {
    "base-url": IConfig["baseUrl"];
    "train-width": IConfig["trainWidth"];
    "line-width": IConfig["lineWidth"];
    "line-shadow": IConfig["lineShadow"];
  }
>;
