import { Thematique } from '../contenu/thematique';
import { BooleanKYC, KYCID, QuestionKYC } from '../kyc/questionQYC';
import { ThematiqueOnboarding } from '../onboarding/onboarding';
import { TransportQuotidien } from '../transport/transport';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Tag } from './tag';

export class UserTagEvaluator {
  public static recomputeRecoTags(user: Utilisateur) {
    user.tag_ponderation_set = {};

    for (const kyc_id in KYCID) {
      UserTagEvaluator.processKYC(user, KYCID[kyc_id]);
    }

    UserTagEvaluator.shopping_addict(user);
    UserTagEvaluator.transport_quotidiens(user);
    UserTagEvaluator.viande_addict(user);
  }

  private static shopping_addict(user: Utilisateur) {
    const impact = user.onboardingResult.getImpact(
      ThematiqueOnboarding.consommation,
    );
    user.increaseTagValue(Tag.shopping_addict, (impact - 1) * 20);
  }

  private static viande_addict(user: Utilisateur) {
    const impact = user.onboardingResult.getImpact(
      ThematiqueOnboarding.alimentation,
    );
    user.increaseTagValue(Tag.viande_addict, (impact - 1) * 20);
  }

  private static transport_quotidiens(user: Utilisateur) {
    if (user.transport.transports_quotidiens) {
      user.increaseTagValueIfElse(
        Tag.utilise_moto_ou_voiture,
        user.transport.transports_quotidiens.includes(
          TransportQuotidien.moto,
        ) ||
          user.transport.transports_quotidiens.includes(
            TransportQuotidien.voiture,
          ),
        100,
        0,
      );
    }
  }
  private static kyc_001(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.transport,
      kyc.includesReponseCode(Thematique.transport),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.alimentation,
      kyc.includesReponseCode(Thematique.alimentation),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.climat,
      kyc.includesReponseCode(Thematique.climat),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.dechet,
      kyc.includesReponseCode(Thematique.dechet),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.logement,
      kyc.includesReponseCode(Thematique.logement),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.loisir,
      kyc.includesReponseCode(Thematique.loisir),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.consommation,
      kyc.includesReponseCode(Thematique.consommation),
      50,
      0,
    );
  }

  private static kyc_002(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_covoit,
      kyc.includesReponseCode('co_voit'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_velo,
      kyc.includesReponseCode('faire_velo'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_marche,
      kyc.includesReponseCode('marcher'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_tec,
      kyc.includesReponseCode('TEC'),
      -100,
      0,
    );
  }

  private static kyc_003(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_velo,
      kyc.includesReponseCode(BooleanKYC.non),
      -100,
      100,
    );
  }

  private static kyc_004(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagForAnswers(Tag.pistes_cyclables, kyc, {
      pistes_cyclables_faciles: 100,
      pistes_cyclables_dangereuses: 100,
      absence_pistes_cyclables: -100,
      ne_sais_pas: 0,
    });
  }

  private static kyc_005(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagForAnswers(Tag.possede_emploi, kyc, {
      emploi: 100,
      sans_emploi: -100,
      ne_sais_pas: 0,
    });
  }

  private static kyc_006(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.logement_plus_15_ans,
      kyc.includesReponseCode('plus_15'),
      100,
      -100,
    );
  }

  private static kyc_007(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_cafe,
      kyc.includesReponseCode('cafe'),
      100,
      0,
    );
  }

  private static kyc_008(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagForAnswers(Tag.capacite_teletravail, kyc, {
      max_tele: 100,
      un_peu_tele: 50,
      no_tele: -100,
      ne_sais_pas: 0,
    });
  }

  private static kyc_009(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_voiture,
      kyc.includesReponseCode('ma_voit'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_covoit,
      kyc.includesReponseCode('co_voit'),
      100,
      0,
    );
  }

  private static kyc_010(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_jardin,
      kyc.includesReponseCode(BooleanKYC.oui),
      100,
      -100,
    );
  }

  private static kyc_011(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_voiture_thermique,
      kyc.includesReponseCode('voit_therm'),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.possede_voiture_elec_hybride,
      kyc.includesReponseCode('voit_elec_hybride'),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.possede_voiture_elec_hybride,
      kyc.includesReponseCode('ne_sais_pas'),
      0,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.possede_voiture_thermique,
      kyc.includesReponseCode('ne_sais_pas'),
      0,
      0,
    );
  }

  private static kyc_012(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.trajet_court_voiture,
      kyc.includesReponseCode(BooleanKYC.oui),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.trajet_long_voiture,
      kyc.includesReponseCode(BooleanKYC.non),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.trajet_court_voiture,
      kyc.includesReponseCode('ne_sais_pas'),
      0,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.trajet_long_voiture,
      kyc.includesReponseCode('ne_sais_pas'),
      0,
      0,
    );
  }

  private static kyc_013(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_limiter_impact_trajets,
      kyc.includesReponseCode('limiter_impact'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_changement_voit,
      kyc.includesReponseCode('achat_voit'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_ecomomies,
      kyc.includesReponseCode('economie'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_bouger_sante,
      kyc.includesReponseCode('bouger'),
      100,
      0,
    );
  }

  private static processKYC(user: Utilisateur, kyc_id: KYCID) {
    const kyc = user.kyc_history.getQuestion(kyc_id);
    if (!(kyc && kyc.hasResponses())) return;
    switch (kyc_id) {
      case KYCID.KYC001:
        UserTagEvaluator.kyc_001(user, kyc);
        break;
      case KYCID.KYC002:
        UserTagEvaluator.kyc_002(user, kyc);
        break;
      case KYCID.KYC003:
        UserTagEvaluator.kyc_003(user, kyc);
        break;
      case KYCID.KYC004:
        UserTagEvaluator.kyc_004(user, kyc);
        break;
      case KYCID.KYC005:
        UserTagEvaluator.kyc_005(user, kyc);
        break;
      case KYCID.KYC006:
        UserTagEvaluator.kyc_006(user, kyc);
        break;
      case KYCID.KYC007:
        UserTagEvaluator.kyc_007(user, kyc);
        break;
      case KYCID.KYC008:
        UserTagEvaluator.kyc_008(user, kyc);
        break;
      case KYCID.KYC009:
        UserTagEvaluator.kyc_009(user, kyc);
        break;
      case KYCID.KYC010:
        UserTagEvaluator.kyc_010(user, kyc);
        break;
      case KYCID.KYC011:
        UserTagEvaluator.kyc_011(user, kyc);
        break;
      case KYCID.KYC012:
        UserTagEvaluator.kyc_012(user, kyc);
        break;
      case KYCID.KYC013:
        UserTagEvaluator.kyc_013(user, kyc);
        break;
    }
  }
}
