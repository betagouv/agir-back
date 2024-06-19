import { Gamification_v0 } from '../object_store/gamification/gamification_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Celebration, CelebrationType } from './celebrations/celebration';
import { Reveal } from './celebrations/reveal';
import { Feature } from './feature';
import { UnlockedFeatures } from './unlockedFeatures';

let SEUILS_NIVEAUX: number[] = [
  100, 150, 300, 400, 500, 800, 1000, 2000, 4000, 10000,
];

export class Gamification {
  points: number;
  celebrations: Celebration[];

  constructor(data?: Gamification_v0, seuils?: number[]) {
    this.reset();

    if (data) {
      if (data.points) {
        this.points = data.points;
      }
      if (data.celebrations) {
        data.celebrations.forEach((celeb_data) => {
          this.celebrations.push(new Celebration(celeb_data));
        });
      }
    }
    if (seuils) {
      SEUILS_NIVEAUX = seuils; // for test purpose
    }
  }

  public reset() {
    this.points = 0;
    this.celebrations = [];
  }

  public terminerCelebration(id: string, utilisateur: Utilisateur) {
    const index = this.celebrations.findIndex((element) => element.id === id);
    const celebration = this.celebrations[index];
    if (celebration && celebration.hasReveal()) {
      utilisateur.unlocked_features.add(celebration.getReveal().feature);
    }
    this.celebrations.splice(index, 1);
  }

  public ajoutePoints(new_points: number, features: UnlockedFeatures) {
    // const current_niveau = this.getNiveau();
    this.points += new_points;
    // const new_niveau = this.getNiveau();

    /*
    if (current_niveau != new_niveau) {
      const celeb = new Celebration({
        id: undefined,
        titre: 'NOUVEAU NIVEAU',
        type: CelebrationType.niveau,
        new_niveau: new_niveau,
        reveal: Gamification.getRevealByNiveau(new_niveau),
      });
      if (
        features.isUnlocked(Feature.defis) &&
        celeb.reveal &&
        celeb.reveal.feature === Feature.defis
      ) {
        delete celeb.reveal;
      }
      this.celebrations.push(celeb);
    }
    */
  }

  public revealDefis() {
    this.celebrations.push(
      new Celebration({
        id: undefined,
        titre: 'NOUVELLE FONCTIONNALITÉ',
        type: CelebrationType.reveal,
        new_niveau: undefined,
        reveal: Reveal.newRevealFromFeature(Feature.defis),
      }),
    );
  }

  public celebrerFinMission(
    thematique_univers: string,
    new_thematiques: string[],
  ) {
    this.celebrations.push(
      new Celebration({
        id: undefined,
        titre: `FIN DE MISSION !`,
        type: CelebrationType.fin_thematique,
        new_thematiques: new_thematiques,
        thematique_univers: thematique_univers,
      }),
    );
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
      return 999;
    }
    const seuil_bas = this.getSeuilOfNiveau(niveau);
    const seuil_haut = this.getSeuilOfNiveau(niveau + 1);
    return seuil_haut - seuil_bas;
  }

  public getSeuilOfNiveau(niveau: number): number {
    if (niveau === 1) return 0;
    return SEUILS_NIVEAUX[niveau - 2];
  }

  public static getRevealByNiveau(new_niveau: number): Reveal {
    switch (new_niveau) {
      case 2:
        return Reveal.newRevealFromFeature(Feature.aides);
      case 3:
        return Reveal.newRevealFromFeature(Feature.services);
      case 4:
        return Reveal.newRevealFromFeature(Feature.recommandations);
      case 5:
        return Reveal.newRevealFromFeature(Feature.bibliotheque);
      case 6:
        return Reveal.newRevealFromFeature(Feature.defis);
    }
    return null;
  }
}
