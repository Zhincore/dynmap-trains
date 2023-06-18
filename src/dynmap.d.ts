type DynMap = any;

declare const componentconstructors: Record<string, (dynmap: DynMap, configuration: any) => void>;

declare function loadcss(path: string, completed: () => void): void;
