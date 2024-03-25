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
    UserTagEvaluator.kyc_003(user);
    UserTagEvaluator.kyc_004(user);
    UserTagEvaluator.kyc_005(user);
    UserTagEvaluator.kyc_006(user);
    UserTagEvaluator.kyc_007(user);
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
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC001);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.transport),
        Tag.transport,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.alimentation),
        Tag.alimentation,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.climat),
        Tag.climat,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.dechet),
        Tag.dechet,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.logement),
        Tag.logement,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.loisir),
        Tag.loisir,
        50,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode(Thematique.consommation),
        Tag.consommation,
        50,
      );
    }
  }
  private static kyc_002(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC002);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode('co_voit'),
        Tag.appetence_covoit,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('faire_velo'),
        Tag.appetence_velo,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('marcher'),
        Tag.appetence_marche,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('TEC'),
        Tag.appetence_tec,
        -100,
      );
    }
  }
  private static kyc_003(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC003);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode('pas_de_velo'),
        Tag.possede_velo,
        -100,
        100,
      );
    }
  }
  private static kyc_004(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC004);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode('pistes_cyclables_faciles') ||
          kyc.includesReponseCode('pistes_cyclables_dangereuses'),
        Tag.pistes_cyclables,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('absence_pistes_cyclables'),
        Tag.pistes_cyclables,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.pistes_cyclables,
        0,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.pistes_cyclables,
        0,
      );
    }
  }
  private static kyc_005(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC005);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode('emploi'),
        Tag.possede_emploi,
        100,
        -100,
      );
      user.setTagWhen(
        kyc.includesReponseCode('sans_emploi'),
        Tag.possede_emploi,
        -100,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.possede_emploi,
        0,
      );
    }
  }
  private static kyc_006(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC006);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode('plus_15'),
        Tag.logement_plus_15_ans,
        100,
        -100,
      );
    }
  }
  private static kyc_007(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC007);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode('cafe'),
        Tag.appetence_cafe,
        100,
      );
    }
  }
}
