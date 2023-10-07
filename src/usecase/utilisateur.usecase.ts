import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { v4 as uuidv4 } from 'uuid';
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
} from '../../src/domain/utilisateur/onboardingData';
import { OnboardingDataAPI } from '../../src/infrastructure/api/types/utilisateur/onboardingDataAPI';
import { OnboardingDataImpactAPI } from '../infrastructure/api/types/utilisateur/onboardingDataImpactAPI';
import { OnboardingResult } from '../../src/domain/utilisateur/onboardingResult';

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
  ) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisateurRespository.findUtilisateursByName(name);
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

    final_result['phrase_1'] = await this.fabriquePhrase1(
      N3,
      onboardingResult,
      nombre_user_total,
    );
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

    return final_result;
  }

  async createUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ): Promise<Utilisateur> {
    let onboardingData: OnboardingData;
    try {
      onboardingData = new OnboardingData(utilisateurInput.onboardingData);
      onboardingData.validateData();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const newUtilisateur = await this.utilisateurRespository.createUtilisateur({
      id: undefined,
      points: 0,
      code_postal: utilisateurInput.onboardingData
        ? utilisateurInput.onboardingData.code_postal
        : undefined,
      created_at: undefined,
      name: utilisateurInput.name || 'Missing Name '.concat(uuidv4()),
      nom: utilisateurInput.nom,
      prenom: utilisateurInput.prenom,
      passwordHash: utilisateurInput.mot_de_passe,
      passwordSalt: uuidv4(),
      email: utilisateurInput.email,
      onboardingData: onboardingData,
      onboardingResult: new OnboardingResult(onboardingData),
      quizzProfile: UserQuizzProfile.newLowProfile(),
      badges: undefined,
    });
    await this.initUtilisateurInteractionSet(newUtilisateur.id);
    return newUtilisateur;
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
      const listThematiques =
        onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
          Impact.eleve,
        );
      return `${pourcent}% des utilisateurs ont, comme vous, des impacts forts ou très forts dans ${N3} thématiques. Dans votre cas, il s'agit des thématiques : ${listThematiques}`;
    } else {
      const nb_users_N3_sup_1 =
        await this.utilisateurRespository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
          Impact.eleve,
          1,
        );

      if (N3 === 1) {
        const pourcent = this.getPourcent(nb_users_N3_sup_1, nombre_user_total);
        const listThematiques =
          onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
            Impact.eleve,
          );
        return `${pourcent}% des utilisateurs ont, comme vous, des impacts forts ou très forts dans au moins une thématique. Dans votre cas, il s'agit de la thématique : ${listThematiques[0]}`;
      } else {
        const pourcent = this.getPourcent(
          nombre_user_total - nb_users_N3_sup_1,
          nombre_user_total,
        );
        return `${pourcent}% des utilisateurs ont, comme vous, des impacts faibles ou très faibles dans l'ensemble des thématiques. vous faîtes partie des utilisateurs les plus sobres, bravo !`;
      }
    }
  }
  private async fabriquePhrase2(
    N2: number,
    onboardingResult: OnboardingResult,
    nombre_user_total: number,
  ): Promise<string> {
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

    let phrase = `${pourcent}% des utilisateurs parviennent à avoir moins d'impacts environnement en matière de ${thematique_No1}.`;
    if (pourcent <= 30) {
      phrase = phrase.concat(
        ' Pas facile, mais les solutions ne manquent pas.',
      );
    }
    return phrase;
  }
  private async fabriquePhrase3(
    N3: number,
    onboardingResult: OnboardingResult,
    nombre_user_total: number,
  ): Promise<string> {
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
      return `${pourcent}% des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}. Vous avez des bonnes pratiques à partager !`;
    }
    if (thematiques_moins_de_3.length === 2) {
      // N3 === 2
      return `${pourcent}% des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]} et de ${thematiques_moins_de_3[1]}. Vous avez des bonnes pratiques à partager !`;
    }
    if (thematiques_moins_de_3.length === 3) {
      // N3 === 1
      return `${pourcent}% des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}, ${thematiques_moins_de_3[1]} et de ${thematiques_moins_de_3[2]}. Vous avez des bonnes pratiques à partager !`;
    }
    if (thematiques_moins_de_3.length === 4) {
      // N3 === 0
      return `${pourcent}% des utilisateurs ont des impacts supérieurs au vôtre en matière de ${thematiques_moins_de_3[0]}, ${thematiques_moins_de_3[1]}, ${thematiques_moins_de_3[2]} et de ${thematiques_moins_de_3[3]}. Vous avez des bonnes pratiques à partager !`;
    }
  }

  private getPourcent(a, b) {
    return Math.floor((a / b) * 100);
  }
}
