import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { DefiStatus } from '../../src/domain/defis/defi';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../domain/mission/missionDefinition';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import { Categorie } from '../domain/contenu/categorie';
import { PonderationApplicativeManager } from '../domain/scoring/ponderationApplicative';

@Injectable()
export class MissionUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private kycRepository: KycRepository,
    private personnalisator: Personnalisator,
    private articleRepository: ArticleRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async terminerMission(
    utilisateurId: string,
    thematique: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let mission =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission) {
      ApplicationError.throwMissionNotFound(thematique);
    }
    if (mission.estTerminable()) {
      const unlocked_thematiques = mission.terminer(utilisateur);

      await this.unlockThematiques(unlocked_thematiques, utilisateur);

      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }
  async getMissionOfThematique(
    utilisateurId: string,
    thematique: string,
  ): Promise<Mission> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let mission_resultat =
      utilisateur.missions.getMissionByThematiqueUnivers(thematique);

    if (!mission_resultat || mission_resultat.isNew()) {
      const mission_def = await this.missionRepository.getByThematique(
        thematique,
      );
      if (mission_def) {
        const completed_mission = await this.completeMissionDef(
          mission_def,
          utilisateur,
        );
        mission_resultat = utilisateur.missions.upsertNewMission(
          completed_mission,
          true,
        );

        await this.utilisateurRepository.updateUtilisateur(utilisateur);
      }
    }

    if (mission_resultat) {
      for (const objectif of mission_resultat.objectifs) {
        if (objectif.type === ContentType.defi) {
          const defi = utilisateur.defi_history.getDefiFromHistory(
            objectif.content_id,
          );
          if (defi) {
            objectif.defi_status = defi.getStatus();
          } else {
            objectif.defi_status = DefiStatus.todo;
          }
        }
      }
      return this.personnalisator.personnaliser(mission_resultat, utilisateur);
    } else {
      throw ApplicationError.throwMissionNotFoundOfThematique(thematique);
    }
  }

  async getMissionNextKycID(
    utilisateurId: string,
    thematique: string,
  ): Promise<string> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

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
      if (mission.isNew()) {
        continue; // on zap, on peut pas gagner des pts sur quoi que ce soit d'une mission pas commencée
      }
      const objectif_courant = mission.findObjectifByTechId(objectifId);
      if (objectif_courant && objectif_courant.type === ContentType.kyc) {
        objectifs_target = objectifs_target.concat(mission.getAllKYCs());
      } else if (objectif_courant) {
        objectifs_target.push(objectif_courant);
      }
    }

    for (const objectif of objectifs_target) {
      if (
        objectif &&
        !objectif.sont_points_en_poche &&
        objectif.isSubContentDone(utilisateur)
      ) {
        objectif.sont_points_en_poche = true;
        utilisateur.gamification.ajoutePoints(objectif.points, utilisateur);
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getMissionKYCs(
    utilisateurId: string,
    thematique: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

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
      result.push(
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          objectif_kyc.content_id,
        ),
      );
    }

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async completeMissionDef(
    mission_def: MissionDefinition,
    utilisateur: Utilisateur,
  ): Promise<MissionDefinition> {
    const code_commune = await this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
    const dept_region =
      await this.communeRepository.findDepartementRegionByCodePostal(
        utilisateur.logement.code_postal,
      );

    const filtre: ArticleFilter = {
      code_postal: utilisateur.logement.code_postal,
      categorie: Categorie.mission,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    };

    const objectifs = mission_def.objectifs;

    mission_def.objectifs = [];

    for (const objectif of objectifs) {
      if (objectif.tag_article) {
        filtre.tag_article = objectif.tag_article;
        const article_candidat_liste =
          await this.articleRepository.searchArticles(filtre);

        PonderationApplicativeManager.increaseScoreContentOfList(
          article_candidat_liste,
          utilisateur.tag_ponderation_set,
        );

        PonderationApplicativeManager.sortContent(article_candidat_liste);

        for (const article of article_candidat_liste) {
          const new_objectif = new ObjectifDefinition({
            content_id: article.content_id,
            titre: article.titre,
            points: objectif.points,
            tag_article: objectif.tag_article,
            type: ContentType.article,
            id_cms: parseInt(article.content_id),
          });
          mission_def.addIfNotContainsAlready(new_objectif);
        }
      } else {
        mission_def.addIfNotContainsAlready(objectif);
      }
    }
    return mission_def;
  }

  private async unlockThematiques(
    unlocked_thematiques: string[],
    utilisateur: Utilisateur,
  ) {
    for (const thematiqueU of unlocked_thematiques) {
      const mission_def = await this.missionRepository.getByThematique(
        thematiqueU,
      );
      if (mission_def) {
        utilisateur.missions.upsertNewMission(mission_def, true);
      }
    }
  }
}
