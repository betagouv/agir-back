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

    const mission =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission) {
      throw ApplicationError.throwMissionNotFound(thematique);
    }

    return mission;
  }
  async getMissionNextKycID(
    utilisateurId: string,
    missionId: string,
  ): Promise<any> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const mission = utilisateur.missions.getMissionById(missionId);

    if (!mission) {
      throw ApplicationError.throwMissionNotFoundOfId(missionId);
    }

    const next_kyc_id = mission.getNextKycId();

    if (!next_kyc_id) {
      throw ApplicationError.throwNoMoreKYCForMission(missionId);
    }
    return next_kyc_id;
  }
}
