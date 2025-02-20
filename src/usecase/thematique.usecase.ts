import { Injectable } from '@nestjs/common';
import { Thematique } from '../domain/thematique/thematique';
import { ThematiqueSynthese } from '../domain/thematique/thematiqueSynthese';
import { ActionUsecase } from './actions.usecase';
import { AidesUsecase } from './aides.usecase';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { ApplicationError } from '../infrastructure/applicationError';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { DetailThematique } from '../domain/thematique/detailThematique';
import { Enchainement } from '../domain/kyc/questionKYC';
import { Key } from 'readline';

const THEMATIQUE_ENCHAINEMENT_MAPPING: Record<Thematique, Enchainement> = {
  alimentation: Enchainement.ENCHAINEMENT_KYC_bilan_alimentation,
  consommation: Enchainement.ENCHAINEMENT_KYC_bilan_consommation,
  logement: Enchainement.ENCHAINEMENT_KYC_bilan_logement,
  transport: Enchainement.ENCHAINEMENT_KYC_bilan_transport,
  climat: Enchainement.ENCHAINEMENT_KYC_1,
  dechet: Enchainement.ENCHAINEMENT_KYC_1,
  loisir: Enchainement.ENCHAINEMENT_KYC_1,
  services_societaux: Enchainement.ENCHAINEMENT_KYC_1,
};

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private aidesUsecase: AidesUsecase,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  public async getUtilisateurThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<DetailThematique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    Utilisateur.checkState(utilisateur);

    const enchainement_id = THEMATIQUE_ENCHAINEMENT_MAPPING[thematique];

    return {
      thematique: thematique,
      enchainement_questions_personalisation: enchainement_id,
      personalisation_necessaire: true,
    };
  }

  public async getUtilisateurListeThematiquesPrincipales(
    utilisateurId: string,
  ): Promise<{
    nom_commune: string;
    thematiques: ThematiqueSynthese[];
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    Utilisateur.checkState(utilisateur);

    return await this.buildSyntheseFromCodeCommune(utilisateur.code_commune);
  }

  public async getListeThematiquesPrincipales(
    code_commune?: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    return await this.buildSyntheseFromCodeCommune(code_commune);
  }

  private async buildSyntheseFromCodeCommune(
    code_commune: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    const result: { nom_commune: string; thematiques: ThematiqueSynthese[] } = {
      nom_commune: undefined,
      thematiques: [],
    };

    if (code_commune) {
      const commune =
        this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
      result.nom_commune = commune.nom;
    }

    const alimentation: ThematiqueSynthese = {
      thematique: Thematique.alimentation,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.alimentation,
      ),
      nombre_aides: await this.aidesUsecase.countAides(
        Thematique.alimentation,
        code_commune,
      ),
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
    };

    const logement: ThematiqueSynthese = {
      thematique: Thematique.logement,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.logement,
      ),
      nombre_aides: await this.aidesUsecase.countAides(
        Thematique.logement,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const transport: ThematiqueSynthese = {
      thematique: Thematique.transport,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.transport,
      ),
      nombre_aides: await this.aidesUsecase.countAides(
        Thematique.transport,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const consommation: ThematiqueSynthese = {
      thematique: Thematique.consommation,
      nombre_actions: await this.actionUsecase.countActions(
        Thematique.consommation,
      ),
      nombre_aides: await this.aidesUsecase.countAides(
        Thematique.consommation,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };

    result.thematiques.push(alimentation, logement, transport, consommation);

    return result;
  }
}
