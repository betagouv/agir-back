import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { Interaction } from '../../src/domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { UtilisateurProfileAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { CreateUtilisateurAPI } from '../../src/infrastructure/api/types/utilisateur/createUtilisateurAPI';
import {
  Impact,
  OnboardingData,
  Thematique,
} from '../../src/domain/utilisateur/onboardingData';
import { OnboardingDataAPI } from '../../src/infrastructure/api/types/utilisateur/onboardingDataAPI';
import { OnboardingDataImpactAPI } from '../infrastructure/api/types/utilisateur/onboardingDataImpactAPI';
import { OnboardingResult } from '../../src/domain/utilisateur/onboardingResult';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class UtilisateurUsecase {
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
  ) {}

  async loginUtilisateur(
    email: string,
    password: string,
  ): Promise<{ utilisateur: Utilisateur; token: string }> {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
    if (!utilisateur) {
      throw new Error('Mauvais email ou mauvais mot de passe');
    }
    if (utilisateur.isLoginLocked()) {
      throw new Error(
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLockedUntilString()}`,
      );
    }
    if (utilisateur.isPasswordOK(password)) {
      return {
        utilisateur: utilisateur,
        token: await this.oidcService.createNewInnerAppToken(utilisateur.id),
      };
    }
    utilisateur.failedLogin();
    await this.utilisateurRespository.updateUtilisateurLoginSecurity(
      utilisateur,
    );
    throw new Error('Mauvais email ou mauvais mot de passe');
  }
  async findUtilisateursByNom(nom: string): Promise<Utilisateur[]> {
    return this.utilisateurRespository.findUtilisateursByNom(nom);
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurByEmail(email);
  }

  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    return this.utilisateurRespository.updateProfile(utilisateurId, profile);
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
    const [N2, N3] = [
      onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
        Impact.faible,
      ),
      onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
        Impact.eleve,
      ),
    ];

    const nombre_user_total =
      await this.utilisateurRespository.nombreTotalUtilisateurs();

    final_result['phrase'] = await this.fabriquePhrase1(
      N3,
      onboardingResult,
      nombre_user_total,
    );
    /*
    final_result['phrase_2'] = await this.fabriquePhrase2(
      N2,
      onboardingResult,
      nombre_user_total,
    );
    final_result['phrase_3'] = await this.fabriquePhrase3(
      N3,
      onboardingResult,
      nombre_user_total,
    );
    */

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
    });

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);

    const newUtilisateur = await this.utilisateurRespository.createUtilisateur(
      utilisateurToCreate,
    );
    await this.initUtilisateurInteractionSet(newUtilisateur.id);
    return newUtilisateur;
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
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurById(id);
  }

  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisateurRespository.listUtilisateur();
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.suiviRepository.delete(utilisateurId);
    await this.interactionRepository.delete(utilisateurId);
    await this.badgeRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.questionNGCRepository.delete(utilisateurId);
    await this.oIDCStateRepository.delete(utilisateurId);
    await this.utilisateurRespository.delete(utilisateurId);
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
      const fraction = this.getFractionFromPourcent(pourcent);
      let thematique_texte = this.listeThematiquesToText(listThematiques);
      return `<strong>Comme ${fraction.num} utilisateur${
        fraction.num > 1 ? 's' : ''
      } sur ${
        fraction.denum
      }, vos impacts sont forts ou très forts dans ${N3} thématiques.</strong> Pour vous il s'agit des thématiques <strong>${thematique_texte}</strong>.`;
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
      const fraction = this.getFractionFromPourcent(pourcent);
      return `<strong>Comme ${fraction.num} utilisateur${
        fraction.num > 1 ? 's' : ''
      } sur ${
        fraction.denum
      }, vos impacts sont forts ou très forts dans au moins une thématique</strong>. Pour vous il s'agit de la thématique <strong>${
        listThematiques[0]
      }</strong>.`;
    }

    const pourcent = this.getPourcent(
      nombre_user_total - nb_users_N3_sup_1,
      nombre_user_total,
    );
    if (isNaN(pourcent)) return null;
    const fraction = this.getFractionFromPourcent(pourcent);
    return `<strong>Comme ${fraction.num} utilisateur${
      fraction.num > 1 ? 's' : ''
    } sur ${
      fraction.denum
    }, vos impacts sont faibles ou très faibles dans l'ensemble des thématiques</strong>. Vous faîtes partie des utilisateurs les plus sobres, bravo !`;
  }
  /*
  private async fabriquePhrase2(
    N2: number,
    onboardingResult: OnboardingResult,
    nombre_user_total: number,
  ): Promise<Phrase> {
    if (N2 === 0) return null;

    const thematique_No1 = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );

    const nombre_user_inferieur_sur_th_No1 =
      await this.utilisateurRespository.countUsersWithLessImpactOnThematique(
        onboardingResult.ventilation_par_thematiques[thematique_No1],
        thematique_No1,
      );

    const pourcent = this.getPourcent(
      nombre_user_inferieur_sur_th_No1,
      nombre_user_total,
    );

    let phrase = `des utilisateurs parviennent à avoir moins d'impacts environnement en matière de ${thematique_No1}.`;
    if (pourcent <= 30) {
      phrase = phrase.concat(
        ' Pas facile, mais les solutions ne manquent pas.',
      );
    }
    return {
      pourcent: pourcent,
      phrase: phrase,
    };
  }
  private async fabriquePhrase3(
    N3: number,
    onboardingResult: OnboardingResult,
    nombre_user_total: number,
  ): Promise<Phrase> {
    if (N3 === 4) return null;

    const thematiques_moins_de_3 =
      onboardingResult.listThematiquesAvecImpactInferieurA(Impact.eleve);

    const impacts_par_thematiques = thematiques_moins_de_3.map((element) =>
      onboardingResult.getImpact(element),
    );

    const nombre_user_moins_bon_thematiques =
      await this.utilisateurRespository.countUsersWithMoreImpactOnThematiques(
        impacts_par_thematiques,
        thematiques_moins_de_3,
      );
    const pourcent = this.getPourcent(
      nombre_user_moins_bon_thematiques,
      nombre_user_total,
    );

    if (thematiques_moins_de_3.length === 1) {
      // N3 === 3
      return {
        pourcent: pourcent,
        phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}. Vous avez des bonnes pratiques à partager !`,
      };
    }
    if (thematiques_moins_de_3.length === 2) {
      // N3 === 2
      return {
        pourcent: pourcent,
        phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]} et de ${thematiques_moins_de_3[1]}. Vous avez des bonnes pratiques à partager !`,
      };
    }
    if (thematiques_moins_de_3.length === 3) {
      // N3 === 1
      return {
        pourcent: pourcent,
        phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}, ${thematiques_moins_de_3[1]} et de ${thematiques_moins_de_3[2]}. Vous avez des bonnes pratiques à partager !`,
      };
    }
    if (thematiques_moins_de_3.length === 4) {
      // N3 === 0
      return {
        pourcent: pourcent,
        phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}, ${thematiques_moins_de_3[1]}, ${thematiques_moins_de_3[2]} et de ${thematiques_moins_de_3[3]}. Vous avez des bonnes pratiques à partager !`,
      };
    }
  }
  */

  private getPourcent(a, b) {
    return Math.floor((a / b) * 100);
  }

  /*

  private gcd(a, b) {
    if (b < 0.0000001) return a;
    return this.gcd(b, Math.floor(a % b));
  }
  */

  private getFractionFromPourcent(pourcent: number): {
    num: number;
    denum: number;
  } {
    const pourcent_arrondi_5 = Math.floor(pourcent / 5) * 5;

    if (pourcent_arrondi_5 <= 50) {
      return {
        num: 1,
        denum: Math.floor(100 / pourcent_arrondi_5),
      };
    } else {
      return {
        num: Math.floor(pourcent_arrondi_5 / 10),
        denum: 10,
      };
    }
    /*
    const fraction = (Math.floor(pourcent / 5) * 5) / 100;
    if (fraction) var len = fraction.toString().length - 2;

    var denominator = Math.pow(10, len);
    var numerator = fraction * denominator;

    var divisor = this.gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    numerator = Math.floor(numerator);
    denominator = Math.floor(denominator);

    return { num: numerator, denum: denominator };
    */
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
