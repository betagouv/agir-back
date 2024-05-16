import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';

@Injectable()
export class MissionUsecase {
  constructor(
    private thematiqueRepository: ThematiqueRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async getMissionOfThematique(
    utilisateurId: string,
    thematique: ThematiqueUnivers,
  ): Promise<any> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const mission = utilisateur.missions.getMission(thematique);

    if (!mission) {
      throw ApplicationError.throwMissionNotFound(thematique);
    }

    return mission;
  }
}
