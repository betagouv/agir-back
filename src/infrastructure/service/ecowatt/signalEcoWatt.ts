export enum EcoWattLevel {
  vert = 1,
  orange = 2,
  rouge = 3,
}

export class SignalEcoWatt {
  niveau: EcoWattLevel;
  message: string;
}