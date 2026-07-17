export type AlertLevel =
    | "GREEN"
    | "YELLOW"
    | "ORANGE"
    | "RED";

export interface CurrentAlert {
    level: AlertLevel;
    title: string;
    description: string;
    recommendation: string;
    updatedAt: string;
}

export interface EarthquakeStatus {
    status: "NORMAL" | "WATCH" | "WARNING";
    warningLevel: "NONE" | "YELLOW" | "ORANGE" | "RED";
    source: string;
    updatedAt: string;
}