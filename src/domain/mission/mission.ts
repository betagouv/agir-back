import { ContentType } from '../contenu/contentType';
import {
  Objectif_v0,
  Mission_v0,
} from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Utilisateur } from '../utilisateur/utilisateur';
import { MissionDefinition } from './missionDefinition';
import { v4 as uuidv4 } from 'uuid';

export class Objectif {
  id: string;
  titre: string;
  content_id: string;
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;

  constructor(data: Objectif_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
    this.is_locked = !!data.is_locked;
    this.done_at = data.done_at;
    this.sont_points_en_poche = !!data.sont_points_en_poche;
  }

  public isDone?() {
    return !!this.done_at;
  }
}

export class Mission {
  id: string;
  done_at: Date;
  thematique_univers: ThematiqueUnivers;
  objectifs: Objectif[];
  prochaines_thematiques: ThematiqueUnivers[];
  est_visible: boolean;

  constructor(data: Mission_v0) {
    this.id = data.id;
    this.done_at = data.done_at;
    this.thematique_univers = data.thematique_univers;
    this.est_visible = data.est_visible;

    this.prochaines_thematiques = [];
    if (data.prochaines_thematiques) {
      this.prochaines_thematiques = data.prochaines_thematiques;
    }

    if (data.done_at) {
      this.done_at = new Date(data.done_at);
    }

    this.objectifs = [];
    if (data.objectifs) {
      data.objectifs.forEach((element) => {
        this.objectifs.push(new Objectif(element));
      });
    }
  }

  public static buildFromDef(def: MissionDefinition): Mission {
    return new Mission({
      done_at: null,
      id: def.id_cms.toString(),
      est_visible: def.est_visible,
      thematique_univers: def.thematique_univers,
      prochaines_thematiques: def.prochaines_thematiques,
      objectifs: def.objectifs.map(
        (o) =>
          new Objectif({
            content_id: o.content_id,
            done_at: null,
            id: uuidv4(),
            is_locked: o.type !== ContentType.kyc,
            points: o.points,
            titre: o.titre,
            type: o.type,
            sont_points_en_poche: false,
          }),
      ),
    });
  }
  public isDone(): boolean {
    return !!this.done_at;
  }
  public findObjectifByTechId(objectifId: string): Objectif {
    return this.objectifs.find((element) => element.id === objectifId);
  }

  public findObjectifKYCByQuestionID?(kycID: string): Objectif {
    return this.objectifs.find(
      (element) =>
        element.type === ContentType.kyc && element.content_id === kycID,
    );
  }
  public findObjectifDefiByID?(defi_id: string): Objectif {
    return this.objectifs.find(
      (element) =>
        element.type === ContentType.defi && element.content_id === defi_id,
    );
  }

  public findAllDefis?(): Objectif[] {
    return this.objectifs.filter(
      (element) => element.type === ContentType.defi,
    );
  }

  public getNextKycId(): string {
    const objectif_kyc = this.objectifs.find(
      (o) => o.type === ContentType.kyc && !o.isDone(),
    );
    return objectif_kyc ? objectif_kyc.content_id : null;
  }

  public answerKyc(kycID: string, utilisateur: Utilisateur) {
    const objectif = this.findObjectifKYCByQuestionID(kycID);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      utilisateur.gamification.ajoutePoints(objectif.points);
      this.unlockContentIfAllKYCsDone();
    }
  }
  public validateDefi(
    defi_id: string,
    utilisateur: Utilisateur,
  ): ThematiqueUnivers[] {
    const objectif = this.findObjectifDefiByID(defi_id);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      utilisateur.gamification.ajoutePoints(objectif.points);
      return this.terminerMissionIfAllDone();
    }
    return [];
  }

  public terminerMissionIfAllDone(): ThematiqueUnivers[] {
    let ready_to_end = true;
    this.objectifs.forEach((objectif) => {
      ready_to_end =
        ready_to_end &&
        (objectif.type !== ContentType.defi || objectif.isDone());
    });
    if (ready_to_end) {
      this.done_at = new Date();
      return this.prochaines_thematiques;
    }
    return [];
  }

  public unlockContentIfAllKYCsDone() {
    let ready = true;
    this.objectifs.forEach((objectif) => {
      ready = ready && (objectif.type !== ContentType.kyc || objectif.isDone());
    });
    if (ready) {
      this.objectifs.forEach((objectif) => {
        if (
          objectif.type === ContentType.article ||
          objectif.type === ContentType.quizz
        ) {
          objectif.is_locked = false;
        }
      });
    }
  }
  public unlockDefiIfAllContentDone() {
    if (this.isAllContentDone()) {
      this.objectifs.forEach((objectif) => {
        if (objectif.type === ContentType.defi) {
          objectif.is_locked = false;
        }
      });
    }
  }
  public isAllContentDone(): boolean {
    let ready = true;
    this.objectifs.forEach((objectif) => {
      ready =
        ready &&
        ((objectif.type !== ContentType.article &&
          objectif.type !== ContentType.quizz) ||
          objectif.isDone());
    });
    return ready;
  }

  public getProgression(): { current: number; target: number } {
    return {
      current: this.objectifs.filter((objectif) => objectif.isDone()).length,
      target: this.objectifs.length,
    };
  }
  public isNew(): boolean {
    return this.objectifs.filter((objectif) => objectif.isDone()).length === 0;
  }
  public findObjectifByTypeAndContentId(
    type: ContentType,
    content_id: string,
  ): Objectif {
    return this.objectifs.find(
      (element) => element.type === type && element.content_id === content_id,
    );
  }

  public getUnlockedDefisIds(): string[] {
    if (this.isAllContentDone()) {
      const defi_objectifs = this.findAllDefis();
      return defi_objectifs.map((d) => d.content_id);
    }
    return [];
  }

  public getAllKYCs() {
    const result: Objectif[] = [];
    for (const obj of this.objectifs) {
      if (obj.type === ContentType.kyc) {
        result.push(obj);
      }
    }
    return result;
  }

  public getProgressionKYC(): { current: number; target: number } {
    let current = 0;
    let target = 0;
    for (const objctif of this.objectifs) {
      if (objctif.type === ContentType.kyc) {
        target++;
        if (objctif.isDone()) {
          current++;
        }
      }
    }
    return { current, target };
  }
}
