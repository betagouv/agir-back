import { KYCID } from '../kyc/KYCID';
import { BooleanKYC, QuestionKYC } from '../kyc/questionKYC';
import { Thematique } from '../thematique/thematique';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Tag } from './tag';

export class UserTagEvaluator {
  public static recomputeRecoTags(user: Utilisateur) {
    user.tag_ponderation_set = {};

    for (const kyc_id in KYCID) {
      UserTagEvaluator.processKYC(user, KYCID[kyc_id]);
    }
  }

  private static kyc_001(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.transport,
      kyc.isSelectedReponseCode(Thematique.transport),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.alimentation,
      kyc.isSelectedReponseCode(Thematique.alimentation),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.climat,
      kyc.isSelectedReponseCode(Thematique.climat),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.dechet,
      kyc.isSelectedReponseCode(Thematique.dechet),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.logement,
      kyc.isSelectedReponseCode(Thematique.logement),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.loisir,
      kyc.isSelectedReponseCode(Thematique.loisir),
      50,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.consommation,
      kyc.isSelectedReponseCode(Thematique.consommation),
      50,
      0,
    );
  }

  private static kyc_002(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_covoit,
      kyc.isSelectedReponseCode('co_voit'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_velo,
      kyc.isSelectedReponseCode('faire_velo'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_marche,
      kyc.isSelectedReponseCode('marcher'),
      -100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_tec,
      kyc.isSelectedReponseCode('TEC'),
      -100,
      0,
    );
  }

  private static kyc_003(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_velo,
      kyc.isSelectedReponseCode(BooleanKYC.oui),
      100,
      -100,
    );
  }

  private static kyc_004(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagForAnswers(Tag.pistes_cyclables, kyc, {
      pistes_cyclables_faciles: 100,
      pistes_cyclables_dangereuses: 50,
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
      kyc.isSelectedReponseCode('plus_15'),
      100,
      -100,
    );
  }
  private static kyc_logement_age(user: Utilisateur, kyc: QuestionKYC) {
    const value = kyc.getReponseSimpleValueAsNumber();
    if (value) {
      user.increaseTagValueIfElse(
        Tag.logement_plus_15_ans,
        value >= 15,
        100,
        -100,
      );
    }
  }

  private static kyc_007(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_cafe,
      kyc.isSelectedReponseCode('cafe'),
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
      kyc.isSelectedReponseCode('ma_voit'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_covoit,
      kyc.isSelectedReponseCode('co_voit'),
      100,
      0,
    );
  }

  private static kyc_010(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_jardin,
      kyc.isSelectedReponseCode(BooleanKYC.oui),
      100,
      -100,
    );
  }

  private static kyc_011(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.possede_voiture_thermique,
      kyc.isSelectedReponseCode('voit_therm'),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.possede_voiture_elec_hybride,
      kyc.isSelectedReponseCode('voit_elec_hybride'),
      100,
      -100,
    );
  }

  private static kyc_012(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.trajet_court_voiture,
      kyc.isSelectedReponseCode(BooleanKYC.oui),
      100,
      -100,
    );
    user.increaseTagValueIfElse(
      Tag.trajet_long_voiture,
      kyc.isSelectedReponseCode(BooleanKYC.non),
      100,
      -100,
    );
  }

  private static kyc_013(user: Utilisateur, kyc: QuestionKYC) {
    user.increaseTagValueIfElse(
      Tag.appetence_limiter_impact_trajets,
      kyc.isSelectedReponseCode('limiter_impact'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_changement_voit,
      kyc.isSelectedReponseCode('achat_voit'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_economies,
      kyc.isSelectedReponseCode('economie'),
      100,
      0,
    );
    user.increaseTagValueIfElse(
      Tag.appetence_bouger_sante,
      kyc.isSelectedReponseCode('bouger'),
      100,
      0,
    );
  }

  private static processKYC(user: Utilisateur, kyc_id: KYCID) {
    const kyc = user.kyc_history.getUpToDateQuestionByCodeOrNull(kyc_id);
    if (!(kyc && kyc.hasAnyResponses())) return;
    switch (kyc_id) {
      case KYCID.KYC001:
        UserTagEvaluator.kyc_001(user, kyc);
        break;
      case KYCID.KYC_preference:
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
      case KYCID.KYC_logement_age:
        UserTagEvaluator.kyc_logement_age(user, kyc);
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
