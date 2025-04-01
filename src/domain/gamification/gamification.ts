import { Gamification_v0 } from '../object_store/gamification/gamification_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Celebration, CelebrationType } from './celebrations/celebration';
import { Reveal } from './celebrations/reveal';
import { Feature } from './feature';
import { TypeBadge } from './typeBadge';

let SEUILS_NIVEAUX: number[] = [
  100, 150, 300, 400, 500, 800, 1000, 2000, 4000, 10000,
];

export class Gamification {
  private points: number;
  celebrations: Celebration[];
  private badges: TypeBadge[];
  private popup_reset_vue: boolean;

  constructor(data?: Gamification_v0, seuils?: number[]) {
    this.popup_reset_vue = true;
    this.points = 0;
    this.celebrations = [];
    this.badges = [];

    if (data) {
      this.popup_reset_vue = !!data.popup_reset_vue;

      if (data.points != undefined && data.points != null) {
        this.points = data.points;
      }
      if (data.badges) {
        this.badges = data.badges;
      }
      if (data.celebrations) {
        this.celebrations = [];
        data.celebrations.forEach((celeb_data) => {
          this.celebrations.push(new Celebration(celeb_data));
        });
      }
    }
    if (seuils) {
      SEUILS_NIVEAUX = seuils; // for test purpose
    }
  }

  public resetV2() {
    this.points = 0;
    this.celebrations = [];
    this.popup_reset_vue = false;
    this.badges = [TypeBadge.pionnier];
  }
  public reset() {
    this.points = 0;
    this.celebrations = [];
    this.popup_reset_vue = true;
    this.badges = [];
  }

  public getBadges(): TypeBadge[] {
    return this.badges;
  }
  public isPopupResetVue(): boolean {
    return this.popup_reset_vue;
  }

  public setPopupResetVue(utilisateur: Utilisateur) {
    if (!this.popup_reset_vue) {
      this.ajoutePoints(200, utilisateur);
    }
    this.popup_reset_vue = true;
    this.badges = [TypeBadge.pionnier];
  }

  public terminerCelebration(id: string, utilisateur: Utilisateur) {
    const index = this.celebrations.findIndex((element) => element.id === id);
    const celebration = this.celebrations[index];
    if (celebration && celebration.hasReveal()) {
      utilisateur.unlocked_features.add(celebration.getReveal().feature);
    }
    this.celebrations.splice(index, 1);
  }

  public ajoutePoints(new_points: number, utilisateur: Utilisateur) {
    this.points += new_points;
    utilisateur.points_classement = this.points;
  }

  public getPoints(): number {
    return this.points;
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

  public celebrerFinMission(thematique_univers: string) {
    this.celebrations.push(
      new Celebration({
        id: undefined,
        titre: `FIN DE MISSION !`,
        type: CelebrationType.fin_thematique,
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
