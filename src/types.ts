
export interface Output {
    clones: Array<unknown>;
    connected: boolean;
    currentModeId: string;
    enabled: boolean;
    followPreferredMode: boolean;
    hdr: boolean;
    icon: string;
    id: number;
    modes: Array<Mode>;
    name: string;
    overscan: number;
    pos: Position;
    preferredModes: string[];
    priority: number;
    replicationSource: number;
    rotation: number;
    scale: number;
    'sdr-brightness': number;
    size: { height: number; width: number };
    sizeMM: { height: number; width: number };
    type: number;
    wcg: boolean
}

export type LayoutConfigOutput = Omit<Partial<Output>, "modes"> & DisplayMode & {
    waylandName: string;
    x11Name: string;
}

export type DisplayMode = DisplayModeOn | DisplayModeOff
export interface DisplayModeOn {
    enabled: true;
    mode: Mode
}
export interface DisplayModeOff {
    enabled: false;
}

export interface Mode {
    refreshRate: number,
    size: { height: number, width: number }
}
export namespace Mode {
    export function isInstance(mode: unknown): mode is Mode {
        return true;
    }
}

export interface Position {
    x: number;
    y: number
}
export namespace Position {
    export function isInstance(pos: unknown): pos is Position {
        return true;
    }
}

export interface LayoutConfig {
    name: string;
    outputs: LayoutConfigOutput[];
}