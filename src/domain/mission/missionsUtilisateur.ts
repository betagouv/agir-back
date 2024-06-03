import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../contenu/contentType';
import { MissionsUtilisateur_v0 } from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Univers } from '../univers/univers';
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

  public getMissionByThematiqueUnivers(them: ThematiqueUnivers): Mission {
    return this.missions.find((m) => m.thematique_univers === them);
  }
  public getMissionById(missionId: string): Mission {
    return this.missions.find((m) => m.id === missionId);
  }

  public addMission(mission_def: MissionDefinition): Mission {
    const new_mission = Mission.buildFromDef(mission_def);
    this.missions.push(new_mission);
    return new_mission;
  }

  public validateAricleOrQuizzDone(
    content_id: string,
    type: ContentType,
    utilisateur: Utilisateur,
    score?: number,
  ) {
    const { mission, objectif } = this.getObjectifByContentId(content_id, type);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      utilisateur.gamification.ajoutePoints(objectif.points);
      mission.unlockDefiIfAllContentDone();
      // Pour éviter de récolter les points d'un quizz raté ^^
      if (type === ContentType.quizz && score !== 100) {
        objectif.sont_points_en_poche = true;
      }
    }
  }

  public answerKyc(kycID: string, utilisateur: Utilisateur) {
    this.missions.forEach((mission) => {
      mission.answerKyc(kycID, utilisateur);
    });
  }

  public validateDefi(
    defi_id: string,
    utilisateur: Utilisateur,
  ): ThematiqueUnivers[] {
    let unlocked_thematiques = [];
    this.missions.forEach((mission) => {
      const thematiqueU = mission.validateDefi(defi_id, utilisateur);
      unlocked_thematiques = unlocked_thematiques.concat(thematiqueU);
    });
    return unlocked_thematiques;
  }

  public getObjectifByContentId(
    content_id: string,
    type: ContentType,
  ): { mission: Mission; objectif: Objectif } {
    for (let index = 0; index < this.missions.length; index++) {
      const mission = this.missions[index];

      const objectif = mission.objectifs.find(
        (o) => o.content_id === content_id && o.type === type,
      );
      if (objectif) return { mission: mission, objectif: objectif };
    }
    return { mission: null, objectif: null };
  }

  public addNewVisibleMission(middion_def: MissionDefinition) {
    if (!this.doesContainMissionOfId(middion_def.id_cms)) {
      const new_mission = Mission.buildFromDef(middion_def);
      new_mission.est_visible = true;
      this.missions.push(new_mission);
    }
  }

  public getAllUnlockedDefisIdsByUnivers(univers: Univers): string[] {
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

  private doesContainMissionOfId(mission_id: number) {
    return this.missions.findIndex((m) => m.id === mission_id.toString()) > -1;
  }
}
