import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../contenu/contentType';
import { DefiDefinition } from '../defis/defiDefinition';
import { KYCMosaicID } from '../kyc/KYCMosaicID';
import { MissionsUtilisateur_v0 } from '../object_store/mission/MissionsUtilisateur_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Mission, Objectif } from './mission';
import { MissionDefinition } from './missionDefinition';

export class MissionsUtilisateur {
  missions: Mission[];

  constructor(data?: MissionsUtilisateur_v0) {
    this.missions = [];
    if (data && data.missions) {
      data.missions.forEach((m) => {
        this.missions.push(new Mission(m));
      });
    }
  }

  public isUniversDone(univers: string): boolean {
    let done = 0;
    let of_univers = 0;
    for (const mission of this.missions) {
      if (mission.univers === univers) {
        of_univers++;
        if (mission.isDone()) {
          done++;
        }
      }
    }
    return done === of_univers && done !== 0;
  }

  public getMissionByThematiqueUnivers(them: string): Mission {
    return this.missions.find((m) => m.thematique_univers === them);
  }
  public getMissionByCode(code: string): Mission {
    return this.missions.find((m) => m.code === code);
  }
  public getMissionById(missionId: string): Mission {
    return this.missions.find((m) => m.id === missionId);
  }

  public validateAricleOrQuizzDone(
    content_id: string,
    type: ContentType,
    score?: number,
  ) {
    const liste = this.getObjectifByContentId(content_id, type);

    for (const mission_objectif of liste) {
      if (mission_objectif.objectif && !mission_objectif.objectif.isDone()) {
        mission_objectif.objectif.done_at = new Date();
        mission_objectif.mission.unlockDefiIfAllContentDone();

        // Pour éviter de récolter les points d'un quizz raté ^^
        if (type === ContentType.quizz && score !== 100) {
          mission_objectif.objectif.sont_points_en_poche = true;
        }
      }
    }
  }

  public recomputeRecoDefi(
    utilisateur: Utilisateur,
    defisDefinitionListe: DefiDefinition[],
  ) {
    this.missions.forEach((mission) => {
      mission.recomputeRecoDefi(utilisateur, defisDefinitionListe);
    });
  }

  public answerKyc(kycID: string) {
    this.missions.forEach((mission) => {
      mission.answerKyc(kycID);
    });
  }

  public answerMosaic(mosaicID: KYCMosaicID) {
    this.missions.forEach((mission) => {
      mission.answerKyc(mosaicID);
    });
  }

  public validateDefiObjectif(defi_id: string) {
    this.missions.forEach((mission) => {
      mission.validateDefiObjectif(defi_id);
    });
  }

  public getObjectifByContentId(
    content_id: string,
    type: ContentType,
  ): { mission: Mission; objectif: Objectif }[] {
    const result = [];
    for (let index = 0; index < this.missions.length; index++) {
      const mission = this.missions[index];

      const objectif = mission.objectifs.find(
        (o) => o.content_id === content_id && o.type === type,
      );
      if (objectif) {
        result.push({ mission: mission, objectif: objectif });
      }
    }
    return result;
  }

  public upsertNewMission(
    mission_def: MissionDefinition,
    visible?: boolean,
  ): Mission {
    const new_mission = Mission.buildFromDef(mission_def);
    if (visible !== undefined) {
      new_mission.est_visible = visible;
    }

    const existing_mission = this.getMissionById(mission_def.id_cms.toString());

    if (existing_mission) {
      this.missions.splice(this.missions.indexOf(existing_mission), 1);
    }
    this.missions.push(new_mission);

    return new_mission;
  }

  public getAllUnlockedDefisIdsByUnivers(univers: string): string[] {
    let result: string[] = [];
    for (const mission of this.missions) {
      const univers_mission = ThematiqueRepository.getUniversParent(
        mission.thematique_univers,
      );
      if (univers_mission === univers) {
        result = result.concat(mission.getUnlockedDefisIds());
      }
    }
    return result;
  }
}
