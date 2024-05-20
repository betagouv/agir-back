import { ContentType } from '../contenu/contentType';
import {
  Objectif_v0,
  Mission_v0,
} from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Univers } from '../univers/univers';
import { Utilisateur } from '../utilisateur/utilisateur';

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
  titre: string;
  done_at: Date;
  thematique_univers: ThematiqueUnivers;
  univers: Univers;
  objectifs: Objectif[];

  constructor(data: Mission_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.done_at = data.done_at;
    this.univers = data.univers;
    this.thematique_univers = data.thematique_univers;

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

  public isDone?(): boolean {
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

  public findObjectifByTypeAndContentId(
    type: ContentType,
    content_id: string,
  ): Objectif {
    return this.objectifs.find(
      (element) => element.type === type && element.content_id === content_id,
    );
  }
}
