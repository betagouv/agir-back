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

  constructor(data: Objectif_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
    this.is_locked = !!data.is_locked;
    this.done_at = data.done_at;
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
            is_locked: false,
            points: o.points,
            titre: o.titre,
            type: o.type,
          }),
      ),
    });
  }
  public isDone(): boolean {
    return !!this.done_at;
  }

  public findObjectifKYCByQuestionID?(kycID: string): Objectif {
    return this.objectifs.find(
      (element) =>
        element.type === ContentType.kyc && element.content_id === kycID,
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
    let ready = true;
    this.objectifs.forEach((objectif) => {
      ready =
        ready &&
        ((objectif.type !== ContentType.article &&
          objectif.type !== ContentType.quizz) ||
          objectif.isDone());
    });
    if (ready) {
      this.objectifs.forEach((objectif) => {
        if (objectif.type === ContentType.defi) {
          objectif.is_locked = false;
        }
      });
    }
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
}
