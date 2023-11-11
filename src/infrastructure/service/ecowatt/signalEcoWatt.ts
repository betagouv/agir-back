export enum EcoWattLevel {
  vert = 1,
  orange = 2,
  rouge = 3,
}

export class SignalEcoWatt {
  label: string;
  isInError: boolean;
  niveau?: EcoWattLevel;
  message?: string;
}
