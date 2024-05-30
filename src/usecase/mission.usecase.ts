import { Injectable } from '@nestjs/common';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';

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
    thematique: ThematiqueUnivers,
  ): Promise<string> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const mission =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission) {
      throw ApplicationError.throwMissionNotFoundOfThematique(thematique);
    }

    const next_kyc_id = mission.getNextKycId();

    if (!next_kyc_id) {
      throw ApplicationError.throwNoMoreKYCForThematique(thematique);
    }
    return next_kyc_id;
  }

  async gagnerPointsDeObjectif(utilisateurId: string, objectifId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let objectifs_target: Objectif[] = [];

    for (const mission of utilisateur.missions.missions) {
      const objectif_courant = mission.findObjectifByTechId(objectifId);
      if (objectif_courant && objectif_courant.type === ContentType.kyc) {
        objectifs_target = objectifs_target.concat(mission.getAllKYCs());
      } else if (objectif_courant) {
        objectifs_target.push(objectif_courant);
      }
    }

    for (const objectif of objectifs_target) {
      if (objectif && !objectif.sont_points_en_poche) {
        objectif.sont_points_en_poche = true;
        utilisateur.gamification.ajoutePoints(objectif.points);
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getMissionKYCs(
    utilisateurId: string,
    thematique: ThematiqueUnivers,
  ): Promise<Objectif[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const mission =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission) {
      throw ApplicationError.throwMissionNotFoundOfThematique(thematique);
    }

    return mission.getAllKYCs();
  }
}
