import { ContentType } from '../contenu/contentType';
import {
  Objectif_v0,
  Mission_v0,
} from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Univers } from '../univers/univers';

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
    this.sont_points_en_poche = !!data.sont_points_en_poche;
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

  public empocherPoints?(element: Objectif): number {
    element.sont_points_en_poche = true;
    return element.points;
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

  public answerKyc(kycID: string) {
    const objectif = this.findObjectifKYCByQuestionID(kycID);

    if (objectif) {
      objectif.done_at = new Date();
    }
  }
}
