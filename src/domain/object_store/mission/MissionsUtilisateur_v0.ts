import { Versioned } from '../versioned';
import { ContentType } from '../../contenu/contentType';
import { Mission, Objectif } from '../../../../src/domain/mission/mission';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';

export class Objectif_v0 {
  id: string;
  titre: string;
  content_id: string;
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
      is_locked: objectif.is_locked,
      done_at: objectif.done_at,
      type: objectif.type,
      points: objectif.points,
      sont_points_en_poche: !!objectif.sont_points_en_poche,
    };
  }
}

export class Mission_v0 {
  id: string;
  done_at: Date;
  thematique_univers: ThematiqueUnivers;
  objectifs: Objectif[];
  prochaines_thematiques: ThematiqueUnivers[];
  est_visible: boolean;

  static map(mission: Mission): Mission_v0 {
    return {
      id: mission.id,
      done_at: mission.done_at,
      thematique_univers: mission.thematique_univers,
      objectifs: mission.objectifs
        ? mission.objectifs.map((m) => Objectif_v0.map(m))
        : [],
      prochaines_thematiques: mission.prochaines_thematiques
        ? mission.prochaines_thematiques.map((m) => ThematiqueUnivers[m])
        : [],
      est_visible: !!mission.est_visible,
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
