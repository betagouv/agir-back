import { ProfileRecommandationUtilisateur } from '../../scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../scoring/system_v2/Tag_v2';
import { Versioned_v0 } from '../versioned';

export class ProfileRecommandationUtilisateur_v0 extends Versioned_v0 {
  liste_tags_actifs: Tag_v2[];

  static serialise(
    domain: ProfileRecommandationUtilisateur,
  ): ProfileRecommandationUtilisateur_v0 {
    return {
      version: 0,
      liste_tags_actifs: domain.getListeTagsActifs(),
    };
  }
}
