import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { Defi_v0 } from '../object_store/defi/defiHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { Utilisateur } from '../utilisateur/utilisateur';
import { ConditionDefi } from './conditionDefi';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export enum DefiStatus {
  todo = 'todo',
  en_cours = 'en_cours',
  pas_envie = 'pas_envie',
  abondon = 'abondon',
  fait = 'fait',
}

export class Defi implements TaggedContent {
  id: string;
  titre: string;
  sous_titre: string;
  points: number;
  pourquoi: string;
  astuces: string;
  thematique: Thematique;
  tags: Tag[];
  private status: DefiStatus;
  date_acceptation: Date;
  score: number;
  accessible: boolean;
  motif: string;
  categorie: Categorie;
  mois: number[];
  conditions: ConditionDefi[][];
  sont_points_en_poche: boolean;
  impact_kg_co2: number;

  constructor(data: Defi_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.sous_titre = data.sous_titre;
    this.points = data.points;
    this.thematique = data.thematique;
    this.tags = data.tags;
    this.astuces = data.astuces;
    this.pourquoi = data.pourquoi;
    this.date_acceptation = data.date_acceptation;
    this.status = data.status;
    this.score = 0;
    this.accessible = !!data.accessible;
    this.motif = data.motif;
    this.categorie = data.categorie;
    this.mois = data.mois ? data.mois : [];
    this.conditions = data.conditions ? data.conditions : [];
    this.sont_points_en_poche = !!data.sont_points_en_poche;
    this.impact_kg_co2 = data.impact_kg_co2;
  }

  public getStatus(): DefiStatus {
    return this.status;
  }
  public setRawStatus(status: DefiStatus) {
    this.status = status;
  }
  public setStatus(status: DefiStatus, utilisateur: Utilisateur) {
    if (status === DefiStatus.en_cours) {
      this.date_acceptation = new Date();
    }
    if (status === DefiStatus.fait && !this.sont_points_en_poche) {
      this.sont_points_en_poche = true;
      utilisateur.gamification.ajoutePoints(this.points, utilisateur);
    }
    this.status = status;
  }
  public getJourRestants(): number | null {
    if (!this.date_acceptation) {
      return null;
    }

    const delta = this.date_acceptation.getTime() + 7 * DAY_IN_MS - Date.now();
    return Math.round(delta / DAY_IN_MS);
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  public getDistinctText(): string {
    return this.titre;
  }
  public isLocal(): boolean {
    return false;
  }
}
