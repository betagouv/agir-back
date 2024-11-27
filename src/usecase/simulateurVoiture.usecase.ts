import { Injectable } from '@nestjs/common';
import { NGCRuleName } from 'src/domain/bilan/ngc';
import { Thematique } from 'src/domain/contenu/thematique';
import { SimulateurVoitureResultat } from 'src/domain/simulateur_voiture/resultats';
import { Scope, Utilisateur } from 'src/domain/utilisateur/utilisateur';
import { SimulateurVoitureRepository } from 'src/infrastructure/repository/simulateurVoiture.repository';
import { UtilisateurRepository } from 'src/infrastructure/repository/utilisateur/utilisateur.repository';

/**
 * List of NGC rules that could be used to calculate the result as both models
 * share some common rules.
 */
const NGC_RULES: NGCRuleName[] = [
  'transport . voiture . gabarit',
  'transport . voiture . motorisation',
  'transport . voiture . thermique . carburant',
  'transport . voiture . thermique . consommation aux 100',
  'transport . voiture . électrique . consommation aux 100',
];

@Injectable()
export class SimulateurVoitureUsecase {
  constructor(
    private simulateurVoitureRepository: SimulateurVoitureRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async calculerResultat(userId: string): Promise<SimulateurVoitureResultat> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.transport,
    ]);

    return this.simulateurVoitureRepository.getResultat({
      'voiture . gabarit': 'petite',
    });
  }

  async getAnsweredNGCQuestions(utilisateur: Utilisateur): Promise<[NGCRuleName, ]> {
    const questions = utilisateur.kyc_history.getAllUpToDateQuestionSet(true);
    const res = [];

    for (const question of questions) {
      if (NGC_RULES.includes(question.ngc_key) && question.is_answererd) {
        res.push(question);
      }
    }

    return res;
  }

  async mapNGCRuleToSimulateurVoitureParams(questions: 
}
