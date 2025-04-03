import { Gamification_v0 } from '../object_store/gamification/gamification_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { TypeBadge } from './typeBadge';

export class Gamification {
  private points: number;
  private badges: TypeBadge[];
  private popup_reset_vue: boolean;

  constructor(data?: Gamification_v0, seuils?: number[]) {
    this.popup_reset_vue = true;
    this.points = 0;
    this.badges = [];

    if (data) {
      this.popup_reset_vue = !!data.popup_reset_vue;

      if (data.points != undefined && data.points != null) {
        this.points = data.points;
      }
      if (data.badges) {
        this.badges = data.badges;
      }
    }
  }

  public resetV2() {
    this.points = 0;
    this.popup_reset_vue = false;
    this.badges = [TypeBadge.pionnier];
  }
  public reset() {
    this.points = 0;
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

  public ajoutePoints(new_points: number, utilisateur: Utilisateur) {
    this.points += new_points;
    utilisateur.points_classement = this.points;
  }

  public getPoints(): number {
    return this.points;
  }
}
