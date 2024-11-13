import { Versioned, Versioned_v1 } from '../versioned';
import { ContentType } from '../../contenu/contentType';
import { Mission, Objectif } from '../../../../src/domain/mission/mission';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { Thematique } from '../../contenu/thematique';
import { MissionsUtilisateur_v0 } from './MissionsUtilisateur_v0';

export class Objectif_v1 {
  id: string;
  titre: string;
  content_id: string;
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;
  est_reco: boolean;

  static map(objectif: Objectif): Objectif_v1 {
    return {
      id: objectif.id,
      titre: objectif.titre,
      content_id: objectif.content_id,
      is_locked: objectif.is_locked,
      done_at: objectif.done_at,
      type: objectif.type,
      points: objectif.points,
      sont_points_en_poche: !!objectif.sont_points_en_poche,
      est_reco: !!objectif.est_reco,
    };
  }
}

export class Mission_v1 {
  id: string;
  done_at: Date;
  objectifs: Objectif_v1[];
  est_visible: boolean;
  is_first: boolean;
  thematique: Thematique;
  titre: string;
  code: string;
  image_url: string;

  static map(mission: Mission): Mission_v1 {
    return {
      id: mission.id_cms,
      done_at: mission.done_at,
      objectifs: mission.objectifs
        ? mission.objectifs.map((m) => Objectif_v1.map(m))
        : [],
      est_visible: !!mission.est_visible,
      thematique: mission.thematique,
      code: mission.code,
      image_url: mission.image_url,
      titre: mission.titre,
      is_first: mission.is_first,
    };
  }
}

export class MissionsUtilisateur_v1 extends Versioned_v1 {
  missions: Mission_v1[];

  static serialise(
    missionsUtilisateur: MissionsUtilisateur,
  ): MissionsUtilisateur_v1 {
    return {
      version: 1,
      missions: missionsUtilisateur.missions.map((elem) =>
        Mission_v1.map(elem),
      ),
    };
  }

  static upgrade(source: MissionsUtilisateur_v0): MissionsUtilisateur_v1 {
    let new_missions: Mission_v1[] = [];
    if (source.missions) {
      for (const mission of source.missions) {
        new_missions.push({
          done_at: mission.done_at,
          est_visible: mission.est_visible,
          id: mission.id,
          image_url: undefined, // nouveaux attributs
          is_first: undefined, // nouveaux attributs
          titre: undefined, // nouveaux attributs
          objectifs: mission.objectifs ? mission.objectifs : [],
          thematique: Thematique[mission.univers], // univers => thematique
          code: mission.thematique_univers, // thematique_univers => code
        });
      }
    }
    return {
      version: 1,
      missions: new_missions,
    };
  }
}
