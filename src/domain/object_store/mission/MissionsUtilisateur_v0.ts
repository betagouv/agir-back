import { Versioned } from '../versioned';
import { ContentType } from '../../contenu/contentType';
import { Mission, Objectif } from '../../../../src/domain/mission/mission';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../../src/domain/univers/univers';

export class Objectif_v0 {
  id: string;
  titre: string;
  content_id: string;
  progression: { current: number; target: number };
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;

  static map(objectif: Objectif): Objectif_v0 {
    return {
      id: objectif.id,
      titre: objectif.titre,
      content_id: objectif.content_id,
      progression: objectif.progression,
      is_locked: objectif.is_locked,
      done_at: objectif.done_at,
      type: objectif.type,
      points: objectif.points,
      sont_points_en_poche: objectif.sont_points_en_poche,
    };
  }
}

export class Mission_v0 {
  id: string;
  titre: string;
  done_at: Date;
  thematique_univers: ThematiqueUnivers;
  univers: Univers;
  objectifs: Objectif[];

  static map(mission: Mission): Mission_v0 {
    return {
      id: mission.id,
      titre: mission.titre,
      done_at: mission.done_at,
      thematique_univers: mission.thematique_univers,
      univers: mission.univers,
      objectifs: mission.objectifs
        ? mission.objectifs.map((m) => Objectif_v0.map(m))
        : [],
    };
  }
}

export class MissionsUtilisateur_v0 extends Versioned {
  missions: Mission_v0[];

  static serialise(
    missionsUtilisateur: MissionsUtilisateur,
  ): MissionsUtilisateur_v0 {
    return {
      version: 0,
      missions: missionsUtilisateur.missions.map((elem) =>
        Mission_v0.map(elem),
      ),
    };
  }
}
