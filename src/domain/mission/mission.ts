import { ContentType } from '../contenu/contentType';
import {
  Objectif_v0,
  Mission_v0,
} from '../object_store/mission/MissionsUtilisateur_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { MissionDefinition } from './missionDefinition';
import { v4 as uuidv4 } from 'uuid';
import { DefiDefinition } from '../defis/defiDefinition';
import { DefiStatus } from '../defis/defi';
import { KYCMosaicID } from '../kyc/KYCMosaicID';

export class Objectif {
  id: string;
  titre: string;
  // FIXME pas un content id pour KYC
  // uniformiser le nommage id_cms ??
  content_id: string;
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;
  est_reco: boolean;
  defi_status?: DefiStatus;

  constructor(data: Objectif_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
    this.is_locked = !!data.is_locked;
    this.done_at = data.done_at;
    this.sont_points_en_poche = !!data.sont_points_en_poche;
    this.est_reco = !!data.est_reco;
  }

  public isDone?() {
    return !!this.done_at;
  }

  public isSubContentDone?(utilisateur: Utilisateur): boolean {
    switch (this.type) {
      case ContentType.kyc:
        return utilisateur.kyc_history.isQuestionAnsweredByCode(
          this.content_id,
        );

      case ContentType.article:
        return utilisateur.history.estArticleLu(this.content_id);

      case ContentType.quizz:
        return utilisateur.history.estQuizzReussi(this.content_id);

      case ContentType.defi:
        return utilisateur.defi_history.estDefiEnCoursOuPlus(this.content_id);

      default:
        return false;
    }
  }
}

export class Mission {
  id: string;
  done_at: Date;
  thematique_univers: string;
  objectifs: Objectif[];
  est_visible: boolean;
  univers: string;

  constructor(data: Mission_v0) {
    this.id = data.id;
    this.done_at = data.done_at;
    this.thematique_univers = data.thematique_univers;
    this.est_visible = data.est_visible;
    this.univers = data.univers;

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
      univers: def.univers,
      objectifs: def.objectifs.map((o) => ({
        content_id: o.content_id,
        done_at: null,
        id: uuidv4(),
        is_locked: o.type !== ContentType.kyc,
        points: o.points,
        titre: o.titre,
        type: o.type,
        sont_points_en_poche: false,
        est_reco: true,
      })),
    });
  }

  public exfiltreObjectifsNonVisibles() {
    this.objectifs = this.objectifs.filter((o) => o.est_reco);
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
  public findObjectifByMosaicID?(mosaicID: KYCMosaicID): Objectif {
    return this.objectifs.find(
      (element) =>
        element.type === ContentType.mosaic && element.content_id === mosaicID,
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

  public answerMosaic(mosaicID: KYCMosaicID) {
    const objectif = this.findObjectifByMosaicID(mosaicID);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      this.unlockContentIfAllKYCsDone();
    }
  }
  public answerKyc(kycID: string) {
    const objectif = this.findObjectifKYCByQuestionID(kycID);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      this.unlockContentIfAllKYCsDone();
    }
  }

  public estTerminable(): boolean {
    if (this.isNew()) return false;

    const obj_defis = this.findAllDefis();
    return obj_defis.findIndex((o) => o.isDone()) > -1;
  }

  public validateDefiObjectif(defi_id: string) {
    const objectif = this.findObjectifDefiByID(defi_id);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
    }
  }

  public terminer(utilisateur: Utilisateur): void {
    this.done_at = new Date();
    utilisateur.gamification.celebrerFinMission(this.thematique_univers);
  }

  public unlockContentIfAllKYCsDone() {
    let ready = true;
    this.objectifs.forEach((objectif) => {
      ready =
        ready &&
        ((objectif.type !== ContentType.kyc &&
          objectif.type !== ContentType.mosaic) ||
          objectif.isDone());
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

  public recomputeRecoDefi(
    utilisateur: Utilisateur,
    defisDefinitionListe: DefiDefinition[],
  ) {
    this.objectifs.forEach((objectif) => {
      const defi = defisDefinitionListe.find(
        (defi) => defi.content_id === objectif.content_id,
      );

      if (!defi) {
        objectif.est_reco = false;
      } else {
        objectif.est_reco = utilisateur.kyc_history.areConditionsMatched(
          defi.conditions,
        );
      }
    });
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

  public getNombreDefisDansMission(): number {
    let result = 0;
    for (const obj of this.objectifs) {
      result += obj.type === ContentType.defi ? 1 : 0;
    }
    return result;
  }
  public getNombreObjectifsDone(): number {
    let result = 0;
    for (const obj of this.objectifs) {
      result += obj.isDone() ? 1 : 0;
    }
    return result;
  }
  public getProgression(): { current: number; target: number } {
    if (this.objectifs.length === 0) {
      return { current: 0, target: 0 };
    }
    const objectifs_done = this.getNombreObjectifsDone();
    const nbr_defis = this.getNombreDefisDansMission();

    const is_done_plus_one = this.isDone() ? 1 : 0;

    if (nbr_defis === 0) {
      return {
        current: objectifs_done + is_done_plus_one,
        target: this.objectifs.length + 1,
      };
    }
    const nbr_defis_minus_one = nbr_defis - 1;

    const target_progression_reelle =
      this.objectifs.length - nbr_defis_minus_one;

    return {
      current:
        Math.min(
          this.objectifs.filter((objectif) => objectif.isDone()).length,
          target_progression_reelle,
        ) + is_done_plus_one,
      target: target_progression_reelle + 1,
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
    const defi_objectifs = this.findAllDefis();
    return defi_objectifs.filter((d) => !d.is_locked).map((d) => d.content_id);
  }

  public getAllKYCsandMosaics() {
    const result: Objectif[] = [];
    for (const obj of this.objectifs) {
      if (obj.type === ContentType.kyc || obj.type === ContentType.mosaic) {
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
