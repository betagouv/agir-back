import { KYCID } from '../../kyc/KYCID';
import { QuestionChoixUnique } from '../../kyc/new_interfaces/QuestionChoixUnique';
import { QuestionKYC } from '../../kyc/questionKYC';
import { Tag_v2 } from './Tag_v2';

export class ProfileUtilisateur {
  liste_tags_positifs: Set<Tag_v2>;
  liste_tags_negatifs: Set<Tag_v2>;

  constructor() {
    this.liste_tags_positifs = new Set();
    this.liste_tags_negatifs = new Set();
  }

  public refreshTagState(kyc: QuestionKYC) {
    switch (kyc.code) {
      case KYCID.KYC_proprietaire:
        const kyc_ = new QuestionChoixUnique(kyc);
        if (kyc_.isSelected('oui')) {
          this.setTag(Tag_v2.est_proprietaire);
        } else if (kyc_.isSelected('non')) {
          this.setAntiTag(Tag_v2.est_proprietaire);
        } else {
          this.removeTag(Tag_v2.est_proprietaire);
        }
        break;
      default:
        break;
    }
  }

  private setTag(tag: Tag_v2) {
    this.liste_tags_positifs.add(tag);
    this.liste_tags_negatifs.delete(tag);
  }
  private setAntiTag(tag: Tag_v2) {
    this.liste_tags_negatifs.add(tag);
    this.liste_tags_positifs.delete(tag);
  }
  private removeTag(tag: Tag_v2) {
    this.liste_tags_negatifs.delete(tag);
    this.liste_tags_positifs.delete(tag);
  }
}
