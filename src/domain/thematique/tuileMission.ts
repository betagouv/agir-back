import { Thematique } from '../contenu/thematique';
import { Mission } from '../mission/mission';
import { MissionDefinition } from '../mission/missionDefinition';
import { PriorityContent } from '../scoring/priorityContent';

export class TuileMission implements PriorityContent {
  titre: string;
  code: string;
  progression: number;
  cible_progression: number;
  is_new: boolean;
  is_first: boolean;
  est_examen: boolean;
  image_url: string;
  thematique: Thematique;

  constructor(data: TuileMission) {
    Object.assign(this, data);
  }

  public static newFromMissionANDMissionDefinition(
    mission: Mission,
    mission_def: MissionDefinition,
  ): TuileMission {
    return new TuileMission({
      image_url: mission_def.image_url,
      is_new: mission.isNew(),
      code: mission_def.code,
      titre: mission_def.titre,
      progression: mission.getProgression().current,
      cible_progression: mission.getProgression().target,
      thematique: mission_def.thematique,
      is_first: mission_def.is_first,
      est_examen: mission_def.est_examen,
    });
  }

  public static newFromMissionDefinition(
    mission_def: MissionDefinition,
  ): TuileMission {
    return new TuileMission({
      image_url: mission_def.image_url,
      is_new: true,
      code: mission_def.code,
      titre: mission_def.titre,
      progression: 0,
      cible_progression: mission_def.objectifs.length, // approximation temporaire
      thematique: mission_def.thematique,
      is_first: mission_def.is_first,
      est_examen: mission_def.est_examen,
    });
  }

  public isDone?(): boolean {
    return this.progression === this.cible_progression;
  }
  public isInProgress?(): boolean {
    return !this.isDone() && !this.is_new;
  }
}
