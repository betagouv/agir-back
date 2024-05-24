import { Thematique } from '../contenu/thematique';
import { Defi_v0 } from '../object_store/defi/defiHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { Univers } from '../univers/univers';
import { Utilisateur } from '../utilisateur/utilisateur';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export enum DefiStatus {
  todo = 'todo',
  en_cours = 'en_cours',
  pas_envie = 'pas_envie',
  deja_fait = 'deja_fait',
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
  universes: Univers[];
  accessible: boolean;
  motif: string;

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
    this.universes = data.universes;
    this.accessible = !!data.accessible;
    this.motif = data.motif;
  }

  public getStatus(): DefiStatus {
    return this.status;
  }
  public setStatus(status: DefiStatus, utilisateur: Utilisateur) {
    if (status === DefiStatus.en_cours) {
      this.date_acceptation = new Date();
    }
    if (status === DefiStatus.deja_fait || status === DefiStatus.fait) {
      utilisateur.gamification.ajoutePoints(this.points);
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
}
