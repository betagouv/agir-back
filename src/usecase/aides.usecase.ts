import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideVelo } from '../domain/aides/aideVelo';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AideRepository } from '../../src/infrastructure/repository/aide.repository';
import { Aide } from 'src/domain/aides/aide';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aidesRetrofitRepository: AidesRetrofitRepository,
    private aideRepository: AideRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideVelo[]> {
    return this.aidesRetrofitRepository.get(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async getCatalogueAides(utilisateurId: string): Promise<Aide[]> {
    const user = await this.utilisateurRepository.getById(utilisateurId);
    return this.aideRepository.search({
      code_postal: user.logement.code_postal,
    });
  }

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const RFR =
      utilisateur.revenu_fiscal === null ? 0 : utilisateur.revenu_fiscal + 1;
    const PARTS = utilisateur.getNombrePartsFiscalesOuEstimee();
    const ABONNEMENT =
      utilisateur.abonnement_ter_loire === null
        ? false
        : utilisateur.abonnement_ter_loire;

    return this.aidesVeloRepository.getSummaryVelos(
      utilisateur.code_postal,
      RFR,
      PARTS,
      prix_velo,
      ABONNEMENT,
    );
  }
}
