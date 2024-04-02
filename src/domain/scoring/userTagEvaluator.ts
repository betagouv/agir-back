import { Thematique } from '../contenu/thematique';
import { BooleanKYC, QuestionID } from '../kyc/questionQYC';
import { ThematiqueOnboarding } from '../onboarding/onboarding';
import { TransportQuotidien } from '../transport/transport';
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
    UserTagEvaluator.kyc_008(user);
    UserTagEvaluator.kyc_009(user);
    UserTagEvaluator.kyc_010(user);
    UserTagEvaluator.kyc_011(user);
    UserTagEvaluator.kyc_012(user);
    UserTagEvaluator.kyc_013(user);
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
      user.setTagSwitchOrZero(kyc, Tag.pistes_cyclables, {
        pistes_cyclables_faciles: 100,
        pistes_cyclables_dangereuses: 100,
        absence_pistes_cyclables: -100,
        ne_sais_pas: 0,
      });
    }
  }
  private static kyc_005(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC005);
    if (kyc && kyc.hasResponses()) {
      user.setTagSwitchOrZero(kyc, Tag.possede_emploi, {
        emploi: 100,
        sans_emploi: -100,
        ne_sais_pas: 0,
      });
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
  private static kyc_008(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC008);
    if (kyc && kyc.hasResponses()) {
      user.setTagSwitchOrZero(kyc, Tag.capacite_teletravail, {
        max_tele: 100,
        un_peu_tele: 50,
        no_tele: -100,
        ne_sais_pas: 0,
      });
    }
  }
  private static kyc_009(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC009);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ma_voit'),
        Tag.possede_voiture,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('co_voit'),
        Tag.appetence_covoit,
        100,
      );
    }
  }
  private static kyc_010(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC010);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode(BooleanKYC.oui),
        Tag.possede_jardin,
        100,
        -100,
      );
    }
  }
  private static kyc_011(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC011);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode('voit_therm'),
        Tag.possede_voiture_thermique,
        100,
        -100,
      );
      user.setTagWhen(
        kyc.includesReponseCode('voit_elec_hybride'),
        Tag.possede_voiture_elec_hybride,
        100,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.possede_voiture_elec_hybride,
        0,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.possede_voiture_thermique,
        0,
      );
    }
  }
  private static kyc_012(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC012);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhen(
        kyc.includesReponseCode(BooleanKYC.oui),
        Tag.trajet_court_voiture,
        100,
        -100,
      );
      user.setTagWhen(
        kyc.includesReponseCode(BooleanKYC.non),
        Tag.trajet_long_voiture,
        100,
        -100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.trajet_court_voiture,
        0,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('ne_sais_pas'),
        Tag.trajet_long_voiture,
        0,
      );
    }
  }
  private static kyc_013(user: Utilisateur) {
    const kyc = user.kyc_history.getQuestion(QuestionID.KYC013);
    if (kyc && kyc.hasResponses()) {
      user.setTagWhenOrZero(
        kyc.includesReponseCode('limiter_impact'),
        Tag.appetence_limiter_impact_trajets,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('achat_voit'),
        Tag.appetence_changement_voit,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('economie'),
        Tag.appetence_ecomomies,
        100,
      );
      user.setTagWhenOrZero(
        kyc.includesReponseCode('bouger'),
        Tag.appetence_bouger_sante,
        100,
      );
    }
  }
}
