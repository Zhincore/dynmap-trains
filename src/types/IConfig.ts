export interface IConfig {
  /** Whether or not should the trains layer be hidden by default */
  hidden: boolean;
  /** Label to use for the trains layer. */
  label: string;
  /** Base url of CTM server */
  baseUrl: string;
  /** Dynmap world name to CTM world name mapping */
  worlds: Record<string, string>;
  /** Width of the rectangles representing trains (in blocks) */
  trainWidth: number;
  /** Width of the lines representing tracks */
  trackWidth: number;
  /** Width of the outline around the track lines */
  trackOutline: number;
  /** Whether or not should the track outline visually separate track segments */
  trackSeparationOutline: boolean;
}

export type InputConfig = Partial<
  Omit<IConfig, "baseUrl" | "trainWidth"> & {
    "base-url": IConfig["baseUrl"];
    "train-width": IConfig["trainWidth"];
    "track-width": IConfig["trackWidth"];
    "track-outline": IConfig["trackOutline"];
    "track-separation-outline": IConfig["trackSeparationOutline"];
  }
>;
