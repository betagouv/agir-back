import { Thematique } from '../contenu/thematique';
import { QuestionID } from '../kyc/questionQYC';
import { ThematiqueOnboarding } from '../utilisateur/onboarding/onboarding';
import { TransportQuotidien } from '../utilisateur/transport';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Tag } from './tag';

export class UserTagEvaluator {
  public static recomputeRecoTags(user: Utilisateur) {
    UserTagEvaluator.transport_quotidiens(user);
    UserTagEvaluator.kyc_001(user);
    UserTagEvaluator.kyc_002(user);
    UserTagEvaluator.shopping_addict(user);
    UserTagEvaluator.viande_addict(user);
  }

  private static shopping_addict(user: Utilisateur) {
    const impact = user.onboardingResult.getImpact(
      ThematiqueOnboarding.consommation,
    );
    user.setTag(Tag.shopping_addict, (impact - 1) * 20);
  }

  private static viande_addict(user: Utilisateur) {
    const impact = user.onboardingResult.getImpact(
      ThematiqueOnboarding.alimentation,
    );
    user.setTag(Tag.viande_addict, (impact - 1) * 20);
  }

  private static transport_quotidiens(user: Utilisateur) {
    if (user.transport.transports_quotidiens) {
      user.setTagWhenOrZero(
        user.transport.transports_quotidiens.includes(
          TransportQuotidien.moto,
        ) ||
          user.transport.transports_quotidiens.includes(
            TransportQuotidien.voiture,
          ),
        Tag.utilise_moto_ou_voiture,
        100,
      );
    }
  }
  private static kyc_001(user: Utilisateur) {
    const kyc_001 = user.kyc_history.getQuestion(QuestionID.KYC001);
    if (kyc_001 && kyc_001.hasResponses()) {
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.transport),
        Tag.transport,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.alimentation),
        Tag.alimentation,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.climat),
        Tag.climat,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.dechet),
        Tag.dechet,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.logement),
        Tag.logement,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.loisir),
        Tag.loisir,
        50,
      );
      user.setTagWhenOrZero(
        kyc_001.includesReponseCode(Thematique.consommation),
        Tag.consommation,
        50,
      );
    }
  }
  private static kyc_002(user: Utilisateur) {
    const kyc_002 = user.kyc_history.getQuestion(QuestionID.KYC002);
    if (kyc_002 && kyc_002.hasResponses()) {
      user.setTagWhenOrZero(
        kyc_002.includesReponseCode('co_voit'),
        Tag.appetence_covoit,
        -100,
      );
      user.setTagWhenOrZero(
        kyc_002.includesReponseCode('faire_velo'),
        Tag.appetence_velo,
        -100,
      );
      user.setTagWhenOrZero(
        kyc_002.includesReponseCode('marcher'),
        Tag.appetence_marche,
        -100,
      );
      user.setTagWhenOrZero(
        kyc_002.includesReponseCode('TEC'),
        Tag.appetence_tec,
        -100,
      );
    }
  }
}
