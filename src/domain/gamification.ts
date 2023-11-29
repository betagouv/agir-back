import { Celebration } from '../infrastructure/api/types/gamification/celebration';

let SEUILS_NIVEAUX: number[] = [5, 20, 40, 70];

export class GamificationData {
  points: number;
  celebrations: Celebration[];
}
export class Gamification extends GamificationData {
  constructor(data: GamificationData, seuils?: number[]) {
    super();
    Object.assign(this, data);
    if (seuils) {
      SEUILS_NIVEAUX = seuils;
    }
  }

  public ajoutePoints?(new_points: number) {
    this.points += new_points;
  }

  public getNiveau(): number {
    const position = SEUILS_NIVEAUX.findIndex((n) => n > this.points);
    return position === -1 ? SEUILS_NIVEAUX.length + 1 : position + 1;
  }

  public getCurrent_points_in_niveau(): number {
    const niveau = this.getNiveau();
    const seuil = this.getSeuilOfNiveau(niveau);
    return this.points - seuil;
  }

  public getPoint_target_in_niveau(): number {
    const niveau = this.getNiveau();
    if (niveau === SEUILS_NIVEAUX.length + 1) {
      return 9999999;
    }
    const seuil_bas = this.getSeuilOfNiveau(niveau);
    const seuil_haut = this.getSeuilOfNiveau(niveau + 1);
    return seuil_haut - seuil_bas;
  }

  public getSeuilOfNiveau(niveau: number): number {
    if (niveau === 1) return 0;
    return SEUILS_NIVEAUX[niveau - 2];
  }

  public static newDefaultGamification(): Gamification {
    return new Gamification({
      points: 0,
      celebrations: [],
    });
  }
}
