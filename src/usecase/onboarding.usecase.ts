import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { Interaction } from '../domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/createUtilisateurAPI';
import {
  Impact,
  OnboardingData,
  Thematique,
} from '../domain/utilisateur/onboardingData';
import { OnboardingDataAPI } from '../infrastructure/api/types/utilisateur/onboardingDataAPI';
import { OnboardingDataImpactAPI } from '../infrastructure/api/types/utilisateur/onboardingDataImpactAPI';
import { OnboardingResult } from '../domain/utilisateur/onboardingResult';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { EmailSender } from '../infrastructure/email/emailSender';
import { PasswordManager } from '../../src/domain/utilisateur/manager/passwordManager';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

const MAUVAIS_CODE_ERROR = `Mauvais code ou adresse électronique`;

@Injectable()
export class OnboardingUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
    private communeRepository: CommuneRepository,
  ) {}

  async validateCode(
    email: string,
    code: string,
  ): Promise<{ utilisateur: Utilisateur; token: string }> {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
    if (!utilisateur) {
      throw new Error(MAUVAIS_CODE_ERROR);
    }
    if (utilisateur.active_account) {
      throw new Error('Ce compte est déjà actif');
    }
    if (utilisateur.isCodeLocked()) {
      throw new Error(
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLoginLockedUntilString()}`,
      );
    }

    const code_ok = utilisateur.checkCodeOKAndChangeState(code);
    await this.utilisateurRespository.updateUtilisateurLoginSecurity(
      utilisateur,
    );
    if (code_ok) {
      utilisateur.resetCodeSendingState();
      await this.utilisateurRespository.updateUtilisateurLoginSecurity(
        utilisateur,
      );
      await this.initUtilisateurInteractionSet(utilisateur.id);
      return {
        utilisateur: utilisateur,
        token: await this.oidcService.createNewInnerAppToken(utilisateur.id),
      };
    }
    if (utilisateur.isCodeLocked()) {
      throw new Error(
        `Trop d'essais successifs, attendez jusqu'à ${utilisateur.getLoginLockedUntilString()}`,
      );
    }
    throw new Error(MAUVAIS_CODE_ERROR);
  }

  async evaluateOnboardingData(
    input: OnboardingDataAPI,
  ): Promise<OnboardingDataImpactAPI> {
    const onboardingData = new OnboardingData(input);
    try {
      onboardingData.validateData();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

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

    final_result.phrase = await this.fabriquePhrase1(
      N3,
      onboardingResult,
      nombre_user_total,
    );
    final_result.phrase_1 = {
      icon: '💰',
      phrase: `Accédez à toutes les <strong>aides publiques pour la transition écologique</strong> en quelques clics : <strong>consommation responsable, vélo, voiture éléctrique, rénovation énergétique</strong> pour les propriétaires…`,
    };

    let ville_candidates = this.communeRepository.getListCommunesParCodePostal(
      onboardingData.code_postal,
    );

    if (final_result.transports >= 3) {
      if (ville_candidates.length > 0) {
        final_result.phrase_2 = {
          icon: '🚌',
          phrase: `Regarder les offres de <strong>transports dans la zone de ${ville_candidates[0]}</strong> en fonction de vos besoins et usages`,
        };
      } else {
        final_result.phrase_2 = {
          icon: '🚌',
          phrase: `Regarder les offres de <strong>transports dans la zone du ${onboardingData.code_postal}</strong> en fonction de vos besoins et usages`,
        };
      }
    } else {
      if (ville_candidates.length > 0) {
        final_result.phrase_2 = {
          icon: '🛒',
          phrase: `Comment et où <strong>consommer de manière plus durable</strong> quand on <strong>habite ${ville_candidates[0]}</strong>`,
        };
      } else {
        final_result.phrase_2 = {
          icon: '🛒',
          phrase: `Comment et où <strong>consommer de manière plus durable</strong> quand on <strong>habite dans le ${onboardingData.code_postal}</strong>`,
        };
      }
    }
    if ((final_result.alimentation = 4)) {
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

    const onboardingData = new OnboardingData(utilisateurInput.onboardingData);

    const utilisateurToCreate = new Utilisateur({
      id: undefined,
      points: 0,
      code_postal: utilisateurInput.onboardingData
        ? utilisateurInput.onboardingData.code_postal
        : undefined,
      created_at: undefined,
      nom: utilisateurInput.nom,
      prenom: utilisateurInput.prenom,
      email: utilisateurInput.email,
      onboardingData: onboardingData,
      onboardingResult: new OnboardingResult(onboardingData),
      quizzProfile: UserQuizzProfile.newLowProfile(),
      badges: undefined,
      passwordHash: null,
      passwordSalt: null,
      active_account: false,
      code: null,
      failed_checkcode_count: 0,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      prevent_checkcode_before: new Date(),
      sent_code_count: 1,
      prevent_sendcode_before: new Date(),
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
      throw new Error(MAUVAIS_CODE_ERROR);
    }
    if (utilisateur.active_account) {
      throw new Error('Ce compte est déjà actif');
    }
    if (utilisateur.isCodeEmailLocked()) {
      throw new Error(
        `Trop d'essais successifs, attendez jusqu'à ${utilisateur.getLoginLockedUntilString()} avant de redemander un code`,
      );
    }
    utilisateur.resetCodeEmailCouterIfNeeded();

    utilisateur.incrementCodeEmailCount();

    await this.utilisateurRespository.updateUtilisateurLoginSecurity(
      utilisateur,
    );

    this.sendValidationCode(utilisateur);
  }

  private checkInputToCreateUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ) {
    new OnboardingData(utilisateurInput.onboardingData).validateData();

    if (!utilisateurInput.nom) {
      throw new Error('Nom obligatoire pour créer un utilisateur');
    }
    if (!utilisateurInput.prenom) {
      throw new Error('Prénom obligatoire pour créer un utilisateur');
    }
    if (!utilisateurInput.email) {
      throw new Error('Email obligatoire pour créer un utilisateur');
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);
    Utilisateur.checkEmailFormat(utilisateurInput.email);
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurById(id);
  }

  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisateurRespository.listUtilisateur();
  }

  async initUtilisateurInteractionSet(utilisateurId: string) {
    const interactionDefinitions =
      await this.interactionDefinitionRepository.getAll();

    for (let index = 0; index < interactionDefinitions.length; index++) {
      const interactionDefinition = interactionDefinitions[index];
      await this.interactionRepository.insertInteractionForUtilisateur(
        utilisateurId,
        new Interaction(interactionDefinition),
      );
    }
  }

  private async fabriquePhrase1(
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
