import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission } from 'src/domain/mission/mission';

@Injectable()
export class MissionUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
  ) {}

  async getMissionOfThematique(
    utilisateurId: string,
    thematique: ThematiqueUnivers,
  ): Promise<Mission> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const mission_courante =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (mission_courante) {
      return mission_courante;
    }

    const mission_def = await this.missionRepository.getByThematique(
      thematique,
    );
    const new_mission = utilisateur.missions.addMission(mission_def);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return new_mission;
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
