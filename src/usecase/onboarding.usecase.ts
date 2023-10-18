import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { Interaction } from '../domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { UtilisateurProfileAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
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

export type Phrase = {
  phrase: string;
  pourcent: number;
};

const MAUVAIS_MDP_ERROR = `Mauvaise adresse électronique ou mauvais mot de passe`;
const MAUVAIS_CODE_ERROR = `Mauvais code ou adresse électronique`;

@Injectable()
export class OnboardingUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private suiviRepository: SuiviRepository,
    private badgeRepository: BadgeRepository,
    private bilanRepository: BilanRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
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
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLockedUntilString()}`,
      );
    }

    const code_ok = utilisateur.checkCodeOK(code);
    await this.utilisateurRespository.updateUtilisateurLoginSecurity(
      utilisateur,
    );
    if (code_ok) {
      await this.initUtilisateurInteractionSet(utilisateur.id);
      return {
        utilisateur: utilisateur,
        token: await this.oidcService.createNewInnerAppToken(utilisateur.id),
      };
    }
    if (utilisateur.isCodeLocked()) {
      throw new Error(
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLockedUntilString()}`,
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

    let final_result = {
      ...onboardingResult.ventilation_par_thematiques,
    };

    // Nk = Nombre de thématiques avec un impact supérieur ou égal à k
    const N3 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.eleve,
    );

    const nombre_user_total =
      await this.utilisateurRespository.nombreTotalUtilisateurs();

    final_result['phrase'] = await this.fabriquePhrase1(
      N3,
      onboardingResult,
      nombre_user_total,
    );

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
      active_account: false,
      failed_checkcode_count: 0,
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
        `Trop d'essais successifs, attendez jusqu'à ${utilisateur.getLockedUntilString()} avant de redemander un code`,
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

    Utilisateur.checkPasswordFormat(utilisateurInput.mot_de_passe);
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
      `Bonjour ${utilisateur.prenom},
    Voici votre code pour valider votre inscription à l'application Agir !
    
    code : ${utilisateur.code}
    
    A très vite !`,
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
