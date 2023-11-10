export enum EcoWattLevel {
  absent = 0,
  vert = 1,
  orange = 2,
  rouge = 3,
}

export class SignalEcoWatt {
  label: string;
  niveau: EcoWattLevel;
  message: string;
}
