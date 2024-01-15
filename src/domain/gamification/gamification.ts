import { Utilisateur } from '../utilisateur/utilisateur';
import { Celebration } from './celebrations/celebration';
import { CelebrationDeNiveau } from './celebrations/celebrationDeNiveau';

let SEUILS_NIVEAUX: number[] = [
  100, 250, 400, 600, 850, 1150, 1500, 2000, 2600, 3300,
];

export class GamificationData {
  points: number;
  celebrations: Celebration[];
}
export class Gamification extends GamificationData {
  constructor(data: GamificationData, seuils?: number[]) {
    super();
    this.points = data.points;
    if (seuils) {
      SEUILS_NIVEAUX = seuils;
    }
    this.celebrations = [];
    if (data.celebrations) {
      data.celebrations.forEach((celeb_data) => {
        this.celebrations.push(new Celebration(celeb_data));
      });
    }
  }

  public terminerCelebration?(id: string, utilisateur: Utilisateur) {
    const index = this.celebrations.findIndex((element) => element.id === id);
    const celebration = this.celebrations[index];
    if (celebration.hasReveal()) {
      utilisateur.unlocked_features.add(celebration.getReveal().feature);
    }
    this.celebrations.splice(index, 1);
  }

  public ajoutePoints?(new_points: number) {
    const current_nivau = this.getNiveau();
    this.points += new_points;
    const new_niveau = this.getNiveau();

    if (current_nivau != new_niveau) {
      this.celebrations.push(new CelebrationDeNiveau(new_niveau));
    }
  }

  public getNiveau?(): number {
    const position = SEUILS_NIVEAUX.findIndex((n) => n > this.points);
    return position === -1 ? SEUILS_NIVEAUX.length + 1 : position + 1;
  }

  public getCurrent_points_in_niveau?(): number {
    const niveau = this.getNiveau();
    const seuil = this.getSeuilOfNiveau(niveau);
    return this.points - seuil;
  }

  public getPoint_target_in_niveau?(): number {
    const niveau = this.getNiveau();
    if (niveau === SEUILS_NIVEAUX.length + 1) {
      return 999;
    }
    const seuil_bas = this.getSeuilOfNiveau(niveau);
    const seuil_haut = this.getSeuilOfNiveau(niveau + 1);
    return seuil_haut - seuil_bas;
  }

  public getSeuilOfNiveau?(niveau: number): number {
    if (niveau === 1) return 0;
    return SEUILS_NIVEAUX[niveau - 2];
  }

  public static newDefaultGamification?(): Gamification {
    return new Gamification({
      points: 0,
      celebrations: [],
    });
  }
}
