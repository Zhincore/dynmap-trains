// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynMap = any;

declare const componentconstructors: Record<string, (dynmap: DynMap, configuration: Record<string, unknown>) => void>;

declare function loadcss(path: string, completed: () => void): void;
