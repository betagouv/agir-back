import { ProfileRecommandationUtilisateur } from '../../scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../scoring/system_v2/Tag_v2';
import { KYCID } from '../KYCID';
import { QuestionChoixUnique } from '../new_interfaces/QuestionChoixUnique';
import { QuestionKYC } from '../questionKYC';

export class KycToTags {
  public static refreshTagState(
    kyc: QuestionKYC,
    profile: ProfileRecommandationUtilisateur,
  ) {
    switch (kyc.code) {
      case KYCID.KYC_proprietaire:
        const kyc_ = new QuestionChoixUnique(kyc);
        if (kyc_.isSelected('oui')) {
          profile.setTag(Tag_v2.est_proprietaire);
        } else if (kyc_.isSelected('non')) {
          profile.setTag(Tag_v2.n_est_pas_proprietaire);
        } else {
          profile.removeTag(Tag_v2.est_proprietaire);
          profile.removeTag(Tag_v2.n_est_pas_proprietaire);
        }
        break;
      default:
        break;
    }
  }
}
