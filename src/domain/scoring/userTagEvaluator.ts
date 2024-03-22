import { Thematique } from '../contenu/thematique';
import { ThematiqueOnboarding } from '../utilisateur/onboarding/onboarding';
import { TransportQuotidien } from '../utilisateur/transport';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Tag } from './tag';

export class UserTagEvaluator {
  public static recomputeRecoTags(user: Utilisateur) {
    UserTagEvaluator.transport_quotidiens(user);
    UserTagEvaluator.kyc_001(user);
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
      if (
        user.transport.transports_quotidiens.includes(
          TransportQuotidien.moto,
        ) ||
        user.transport.transports_quotidiens.includes(
          TransportQuotidien.voiture,
        )
      ) {
        user.setTag(Tag.utilise_moto_ou_voiture, 100);
      } else {
        user.setTag(Tag.utilise_moto_ou_voiture, 0);
      }
    }
  }
  private static kyc_001(user: Utilisateur) {
    const kyc_001 = user.kyc_history.getQuestionOrException('001');
    if (kyc_001.reponses) {
      if (kyc_001.includesReponseCode(Thematique.transport)) {
        user.setTag(Tag.transport, 50);
      } else {
        user.setTag(Tag.transport, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.alimentation)) {
        user.setTag(Tag.alimentation, 50);
      } else {
        user.setTag(Tag.alimentation, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.climat)) {
        user.setTag(Tag.climat, 50);
      } else {
        user.setTag(Tag.climat, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.dechet)) {
        user.setTag(Tag.dechet, 50);
      } else {
        user.setTag(Tag.dechet, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.logement)) {
        user.setTag(Tag.logement, 50);
      } else {
        user.setTag(Tag.logement, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.loisir)) {
        user.setTag(Tag.loisir, 50);
      } else {
        user.setTag(Tag.loisir, 0);
      }
      if (kyc_001.includesReponseCode(Thematique.consommation)) {
        user.setTag(Tag.consommation, 50);
      } else {
        user.setTag(Tag.consommation, 0);
      }
    }
  }
}
