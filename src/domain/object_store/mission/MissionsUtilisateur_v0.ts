import { Versioned, Versioned_v0 } from '../versioned';
import { ContentType } from '../../contenu/contentType';
import { Mission, Objectif } from '../../../../src/domain/mission/mission';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { ApplicationError } from '../../../infrastructure/applicationError';

export class Objectif_v0 {
  id: string;
  titre: string;
  content_id: string;
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;
  est_reco: boolean;

  static map(objectif: Objectif): Objectif_v0 {
    throw ApplicationError.throwUnsupportedSerialisationVersion('Objectif_v0');
  }
}

export class Mission_v0 {
  id: string;
  done_at: Date;
  thematique_univers: string;
  objectifs: Objectif_v0[];
  est_visible: boolean;
  univers: string;

  static map(mission: Mission): Mission_v0 {
    throw ApplicationError.throwUnsupportedSerialisationVersion('Mission_v0');
  }
}

export class MissionsUtilisateur_v0 extends Versioned_v0 {
  missions: Mission_v0[];

  static serialise(
    missionsUtilisateur: MissionsUtilisateur,
  ): MissionsUtilisateur_v0 {
    throw ApplicationError.throwUnsupportedSerialisationVersion(
      'MissionsUtilisateur_v0',
    );
  }
}
