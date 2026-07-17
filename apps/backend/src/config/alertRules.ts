export const ALERT_RULES = {
  tsunami: {
    AWAS: "RED",
    SIAGA: "ORANGE",
    WASPADA: "YELLOW",
    NORMAL: "GREEN",
  },

  earthquake: {
    monitoringMagnitude: 5,
    significantMagnitude: 6,
  },

  radius: {
    HIGH: 100,
    MEDIUM: 250,
  },
} as const;