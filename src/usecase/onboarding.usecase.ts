import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import {
  Impact,
  Onboarding,
  ThematiqueOnboarding,
} from '../domain/onboarding/onboarding';
import { OnboardingDataAPI } from '../infrastructure/api/types/utilisateur/onboarding/onboardingDataAPI';
import { OnboardingDataImpactAPI } from '../infrastructure/api/types/utilisateur/onboarding/onboardingDataImpactAPI';
import { OnboardingResult } from '../domain/onboarding/onboardingResult';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CodeManager } from '../../src/domain/utilisateur/manager/codeManager';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { ContactUsecase } from './contact.usecase';
import { Utilisateur } from 'src/domain/utilisateur/utilisateur';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class OnboardingUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private oidcService: OidcService,
    private contactUsecase: ContactUsecase,
    private securityEmailManager: SecurityEmailManager,
  ) {}

  async validateCode(
    email: string,
    code: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRespository.findByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
    }

    const codeOkAction = async () => {
      await this.securityEmailManager.resetEmailSendingState(utilisateur);
      await this.utilisateurRespository.activateAccount(utilisateur.id);
      await this.contactUsecase.create(utilisateur);

      const token = await this.oidcService.createNewInnerAppToken(
        utilisateur.id,
      );
      return { token };
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async evaluateOnboardingData(
    input: OnboardingDataAPI,
  ): Promise<OnboardingDataImpactAPI> {
    const onboarding = new Onboarding(OnboardingDataAPI.convertToDomain(input));

    onboarding.validateData();

    const onboardingResult = OnboardingResult.buildFromOnboarding(onboarding);

    let final_result: OnboardingDataImpactAPI = {
      ...onboardingResult.ventilation_par_thematiques,
    };

    // Nk = Nombre de thématiques avec un impact supérieur ou égal à k
    const N3 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.eleve,
    );

    const nombre_user_total =
      await this.utilisateurRespository.nombreTotalUtilisateurs();

    final_result.phrase = await this.fabriquePhrase(
      N3,
      onboardingResult,
      nombre_user_total,
    );
    final_result.phrase_1 = {
      icon: '💰',
      phrase: `Accédez à toutes les <strong>aides publiques pour la transition écologique</strong> en quelques clics : <strong>consommation responsable, vélo, voiture éléctrique, rénovation énergétique</strong> pour les propriétaires…`,
    };

    if (final_result.transports >= 3) {
      final_result.phrase_2 = {
        icon: '🚌',
        phrase: `Regarder les offres de <strong>transports dans la zone de ${onboarding.commune}</strong> en fonction de vos besoins et usages`,
      };
    } else {
      final_result.phrase_2 = {
        icon: '🛒',
        phrase: `Comment et où <strong>consommer de manière plus durable</strong> quand on <strong>habite ${onboarding.commune}</strong>`,
      };
    }
    if (final_result.alimentation == 4) {
      final_result.phrase_3 = {
        icon: '🍽️',
        phrase: `Trouver des solutions <strong>même quand on adore la viande</strong>`,
      };
    } else {
      final_result.phrase_3 = {
        icon: '🍽️',
        phrase: `Comprendre en détails les impacts de vos repas préférés, trouver des recettes pour les réduire`,
      };
    }

    if (onboarding.adultes + onboarding.enfants >= 3) {
      final_result.phrase_4 = {
        icon: '👪',
        phrase: `${onboarding.adultes + onboarding.enfants} sous le même toit ?
<strong>Comprendre ses impacts à l'échelle de votre famille</strong> ou de votre colocation`,
      };
    } else {
      final_result.phrase_4 = {
        icon: '🏠',
        phrase: `Suivre votre <strong>consommation énergétique, la comparer avec celles des foyers similaires</strong> et identifier les petits gestes pour <strong>faire de grosses économies</strong>`,
      };
    }
    return final_result;
  }

  private async fabriquePhrase(
    N3: number,
    onboardingResult: OnboardingResult,
    nombre_user_total: number,
  ): Promise<string> {
    if (N3 >= 2) {
      const nb_users_N3_sup_2 =
        await this.utilisateurRespository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
          Impact.eleve,
          2,
        );
      const pourcent = this.getPourcent(nb_users_N3_sup_2, nombre_user_total);
      if (isNaN(pourcent)) return null;

      const listThematiques =
        onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
          Impact.eleve,
        );
      let thematique_texte = this.listeThematiquesToText(listThematiques);

      return this.buildStartPhrase(pourcent).concat(
        `, vos impacts sont forts ou très forts dans ${N3} thématiques.</strong> Pour vous il s'agit des thématiques <strong>${thematique_texte}</strong>.`,
      );
    }

    const nb_users_N3_sup_1 =
      await this.utilisateurRespository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.eleve,
        1,
      );

    if (N3 === 1) {
      const pourcent = this.getPourcent(nb_users_N3_sup_1, nombre_user_total);
      if (isNaN(pourcent)) return null;
      const listThematiques =
        onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
          Impact.eleve,
        );
      return this.buildStartPhrase(pourcent).concat(
        `, vos impacts sont forts ou très forts dans au moins une thématique</strong>. Pour vous il s'agit de la thématique <strong>${listThematiques[0]}</strong>.`,
      );
    }

    const pourcent = this.getPourcent(
      nombre_user_total - nb_users_N3_sup_1,
      nombre_user_total,
    );
    if (isNaN(pourcent)) return null;
    return this.buildStartPhrase(pourcent).concat(
      `, vos impacts sont faibles ou très faibles dans l'ensemble des thématiques</strong>. Vous faîtes partie des utilisateurs les plus sobres, bravo !`,
    );
  }

  private buildStartPhrase(pourcent: number): string {
    const fraction = OnboardingUsecase.getFractionFromPourcent(pourcent);
    if (fraction.num === fraction.denum) {
      return '<strong>Comme la majorité des utilisateurs';
    } else {
      return `<strong>Comme ${fraction.num} utilisateur${
        fraction.num > 1 ? 's' : ''
      } sur ${fraction.denum}`;
    }
  }

  private getPourcent(a, b) {
    return Math.floor((a / b) * 100);
  }

  public static getFractionFromPourcent(pourcent: number): {
    num: number;
    denum: number;
  } {
    const pourcent_arrondi_5 = Math.floor(pourcent / 5) * 5;

    if (pourcent_arrondi_5 < 55) {
      return {
        num: 1,
        denum: Math.floor(100 / pourcent_arrondi_5),
      };
    } else if (pourcent_arrondi_5 === 55) {
      return {
        num: 1,
        denum: 2,
      };
    } else {
      return {
        num: Math.floor(pourcent_arrondi_5 / 10),
        denum: 10,
      };
    }
  }

  private listeThematiquesToText(list: ThematiqueOnboarding[]) {
    switch (list.length) {
      case 1:
        return `${list[0]}`;
      case 2:
        return `${list[0]} et ${list[1]}`;
      case 3:
        return `${list[0]}, ${list[1]} et ${list[2]}`;
      case 4:
        return `${list[0]}, ${list[1]}, ${list[2]} et ${list[3]}`;
    }
    return '';
  }
}
