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

  async getSummaryVelos(
    codePostal: string,
    revenu_fiscal: number,
    parts: number,
    prixVelo: number,
  ): Promise<AidesVeloParType> {
    return this.aidesVeloRepository.getSummaryVelos(
      codePostal,
      revenu_fiscal,
      parts,
      prixVelo,
    );
  }
  async simulerAideVeloV2(
    utilisateurId: string,
    prix_velo: number,
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return this.aidesVeloRepository.getSummaryVelos(
      utilisateur.code_postal,
      utilisateur.revenu_fiscal,
      utilisateur.parts,
      prix_velo,
    );
  }
}
