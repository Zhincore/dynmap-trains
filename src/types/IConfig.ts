import { APIObjects } from "./APITypes";

interface ILayerConfig {
  /** Whether or not should the layer be hidden by default */
  hidden: boolean;
  /** Label to use for the layer. */
  label: string;
}

export interface IConfig {
  /** Base url of CTM server */
  baseUrl: string;
  /** Dynmap world name to CTM world name mapping */
  worlds: Record<string, string>;
  /** Configuration for each layer */
  layers: Record<keyof APIObjects, ILayerConfig>;
  /** Additional texts used in the UI */
  labels: {
    /** Tolltip for portal marker */
    portal: string;
  };
  /** Width of the rectangles representing trains (in blocks) */
  trainWidth: number;
  /** Width of the lines representing tracks */
  trackWidth: number;
  /** Width of the outline around the track lines */
  trackOutline: number;
  /** Whether or not should the track outline visually separate track segments */
  trackSeparationOutline: boolean;
  /** `watch_interval_seconds` in CTM's config. Automatically determined on runtime */
  updateInterval: number;
}

export type InputConfig = Partial<
  Omit<
    IConfig,
    "baseUrl" | "trainWidth" | "trackWidth" | "trackOutline" | "trackSeparationOutline" | "updateInterval"
  > & {
    "base-url": IConfig["baseUrl"];
    "train-width": IConfig["trainWidth"];
    "track-width": IConfig["trackWidth"];
    "track-outline": IConfig["trackOutline"];
    "track-separation-outline": IConfig["trackSeparationOutline"];
    "update-interval": IConfig["updateInterval"];
  }
>;
