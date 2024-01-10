import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { Interaction } from '../domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI';
import {
  Impact,
  Onboarding,
  Thematique,
} from '../domain/utilisateur/onboarding/onboarding';
import { OnboardingDataAPI } from '../infrastructure/api/types/utilisateur/onboarding/onboardingDataAPI';
import { OnboardingDataImpactAPI } from '../infrastructure/api/types/utilisateur/onboarding/onboardingDataImpactAPI';
import { OnboardingResult } from '../domain/utilisateur/onboarding/onboardingResult';
import { EmailSender } from '../infrastructure/email/emailSender';
import { PasswordManager } from '../../src/domain/utilisateur/manager/passwordManager';
import { CodeManager } from '../../src/domain/utilisateur/manager/codeManager';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { Gamification } from '../domain/gamification/gamification';
import { ParcoursTodo } from '../../src/domain/todo/parcoursTodo';
import { UnlockedFeatures } from '../../src/domain/gamification/unlockedFeatures';
import { History } from '../../src/domain/history/history';
import { UtilisateurBehavior } from '../../src/domain/utilisateur/utilisateurBehavior';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class OnboardingUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private oidcService: OidcService,
    private securityEmailManager: SecurityEmailManager,
  ) {}

  async validateCode(
    email: string,
    code: string,
  ): Promise<{ utilisateur: Utilisateur; token: string }> {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
    }

    const _this = this;
    const codeOkAction = async function () {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      await _this.utilisateurRespository.activateAccount(utilisateur.id);
      if (UtilisateurBehavior.does_init_interactions_from_def()) {
        await _this.initUtilisateurInteractionSet(utilisateur.id);
      }
      return {
        utilisateur: utilisateur,
        token: await _this.oidcService.createNewInnerAppToken(utilisateur.id),
      };
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
    const onboardingData = new Onboarding(input);
    onboardingData.validateData();

    const onboardingResult = new OnboardingResult(onboardingData);

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
        phrase: `Regarder les offres de <strong>transports dans la zone de ${onboardingData.commune}</strong> en fonction de vos besoins et usages`,
      };
    } else {
      final_result.phrase_2 = {
        icon: '🛒',
        phrase: `Comment et où <strong>consommer de manière plus durable</strong> quand on <strong>habite ${onboardingData.commune}</strong>`,
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

    if (onboardingData.adultes + onboardingData.enfants >= 3) {
      final_result.phrase_4 = {
        icon: '👪',
        phrase: `${
          onboardingData.adultes + onboardingData.enfants
        } sous le même toit ?
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

  async createUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ): Promise<Utilisateur> {
    this.checkInputToCreateUtilisateur(utilisateurInput);

    if (process.env.WHITE_LIST_ENABLED === 'true') {
      if (
        !process.env.WHITE_LIST.toLowerCase().includes(
          utilisateurInput.email.toLowerCase(),
        )
      ) {
        ApplicationError.throwNotAuthorizedEmailError();
      }
    }

    const onboardingData = new Onboarding(utilisateurInput.onboardingData);

    const utilisateurToCreate = new Utilisateur({
      id: undefined,
      code_postal: onboardingData.code_postal,
      commune: onboardingData.commune,
      created_at: undefined,
      nom: utilisateurInput.nom,
      prenom: utilisateurInput.prenom,
      email: utilisateurInput.email,
      onboardingData: onboardingData,
      onboardingResult: new OnboardingResult(onboardingData),
      quizzProfile: UserQuizzProfile.newLowProfile(),
      revenu_fiscal: null,
      parts: null,
      abonnement_ter_loire: false,
      passwordHash: null,
      passwordSalt: null,
      active_account: false,
      code: null,
      code_generation_time: null,
      failed_checkcode_count: 0,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      prevent_checkcode_before: new Date(),
      sent_email_count: 1,
      prevent_sendemail_before: new Date(),
      parcours_todo: new ParcoursTodo(),
      gamification: Gamification.newDefaultGamification(),
      unlocked_features: new UnlockedFeatures(),
      history: History.newHistory(),
      code_departement: null,
      prm: null,
      version: UtilisateurBehavior.systemVersion(),
    });

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);

    const newUtilisateur = await this.utilisateurRespository.createUtilisateur(
      utilisateurToCreate,
    );

    this.sendValidationCode(utilisateurToCreate);

    return newUtilisateur;
  }

  async renvoyerCode(email: string) {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
    }

    utilisateur.setNew6DigitCode();
    await this.utilisateurRespository.updateCode(
      utilisateur.id,
      utilisateur.code,
      utilisateur.code_generation_time,
    );

    const _this = this;
    const okAction = async function () {
      _this.sendValidationCode(utilisateur);
    };

    await this.securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      okAction,
    );
  }

  private checkInputToCreateUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ) {
    new Onboarding(utilisateurInput.onboardingData).validateData();

    if (!utilisateurInput.nom) {
      ApplicationError.throwNomObligatoireError();
    }
    if (!utilisateurInput.prenom) {
      ApplicationError.throwPrenomObligatoireError();
    }
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);
    Utilisateur.checkEmailFormat(utilisateurInput.email);
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurById(id);
  }

  async initUtilisateurInteractionSet(utilisateurId: string) {
    const interactionDefinitions =
      await this.interactionDefinitionRepository.getAll();

    for (let index = 0; index < interactionDefinitions.length; index++) {
      const interactionDefinition = interactionDefinitions[index];
      await this.interactionRepository.insertInteractionForUtilisateur(
        utilisateurId,
        Interaction.newDefaultInteractionFromDefinition(interactionDefinition),
      );
    }
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

  private async sendValidationCode(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Voici votre code pour valider votre inscription à l'application Agir !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="${process.env.BASE_URL_FRONT}/validation-compte?email=${utilisateur.email}">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      `Votre code d'inscription Agir`,
    );
  }

  private listeThematiquesToText(list: Thematique[]) {
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
