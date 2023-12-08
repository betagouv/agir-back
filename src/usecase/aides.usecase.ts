import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import { AidesVeloParType, AideBase } from '../../src/domain/aides/aide';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aidesRetrofitRepository: AidesRetrofitRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideBase[]> {
    return this.aidesRetrofitRepository.get(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const RFR = utilisateur.revenu_fiscal ? utilisateur.revenu_fiscal + 1 : 1;
    const PARTS = utilisateur.parts ? utilisateur.parts : 0;
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
