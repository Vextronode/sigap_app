import { AlertLevel } from "../../generated/prisma/enums.js";
import type { EarthquakeInfo } from "./earthquake.types.js";

export type TsunamiStatus = "NORMAL" | "WASPADA" | "SIAGA" | "AWAS";


export interface DecisionInput {
  earthquake?: EarthquakeInfo | null;

  tsunamiStatus?: TsunamiStatus;

  tsunamiHeight?: number | null;
}

export interface DecisionResult {
  level: AlertLevel;
  source: string;
  description: string;
}

export interface CurrentAlert {
    level: AlertLevel;
    title: string;
    description: string;
    recommendation: string;
    updatedAt: string;
}

export interface AlertRecord {
  id: string;
  level: AlertLevel;
  source: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EarthquakeStatus {
    status: "NORMAL" | "WATCH" | "WARNING";
    warningLevel: "NONE" | "YELLOW" | "ORANGE" | "RED";
    source: string;
    updatedAt: string;
}
