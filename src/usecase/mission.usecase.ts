import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';
import { QuestionKYC } from '../../src/domain/kyc/questionQYC';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';

@Injectable()
export class MissionUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private kycRepository: KycRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getMissionOfThematique(
    utilisateurId: string,
    thematique: string,
  ): Promise<Mission> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    let mission_resultat =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission_resultat) {
      const mission_def = await this.missionRepository.getByThematique(
        thematique,
      );
      mission_resultat = utilisateur.missions.addMission(mission_def);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    this.personnalisator.personnaliser(mission_resultat, utilisateur);

    return mission_resultat;
  }

  async getMissionNextKycID(
    utilisateurId: string,
    thematique: string,
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
        utilisateur.gamification.ajoutePoints(
          objectif.points,
          utilisateur.unlocked_features,
        );
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getMissionKYCs(
    utilisateurId: string,
    thematique: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(catalogue);

    const mission =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission) {
      throw ApplicationError.throwMissionNotFoundOfThematique(thematique);
    }

    const result: QuestionKYC[] = [];

    const liste_objectifs_kyc = mission.getAllKYCs();

    for (const objectif_kyc of liste_objectifs_kyc) {
      result.push(utilisateur.kyc_history.getQuestion(objectif_kyc.content_id));
    }

    return result;
  }
}
