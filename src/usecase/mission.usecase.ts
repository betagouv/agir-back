import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { DefiStatus } from '../../src/domain/defis/defi';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../domain/mission/missionDefinition';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import { Categorie } from '../domain/contenu/categorie';
import { PonderationApplicativeManager } from '../domain/scoring/ponderationApplicative';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { TuileMission } from '../domain/thematique/tuileMission';
import { Thematique } from '../domain/contenu/thematique';
import { PriorityContent } from '../domain/scoring/priorityContent';
import { QuestionKYC } from '../domain/kyc/questionKYC';

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

  async getTuilesMissionsRecommandeesToutesThematiques(
    utilisateurId: string,
  ): Promise<TuileMission[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.missions, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const final_result: TuileMission[] = [];

    const liste_thematiques = Object.values(Thematique);
    for (const thematique of liste_thematiques) {
      const liste_missions = await this.getOrderedListeMissionsOfThematique(
        thematique,
        utilisateur,
        true,
      );
      if (liste_missions.length > 0) {
        final_result.push(liste_missions[0]);
      }
    }

    return this.personnalisator.personnaliser(final_result, utilisateur);
  }

  async getTuilesMissionsOfThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<TuileMission[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.missions, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const final_result = await this.getOrderedListeMissionsOfThematique(
      thematique,
      utilisateur,
    );

    return this.personnalisator.personnaliser(final_result, utilisateur);
  }

  private async getOrderedListeMissionsOfThematique(
    thematique: Thematique,
    utilisateur: Utilisateur,
    exclude_done?: boolean,
  ): Promise<TuileMission[]> {
    const listMissionDefs = this.missionRepository.getByThematique(thematique);

    const result: TuileMission[] = [];

    for (const mission_def of listMissionDefs) {
      if (!mission_def.est_visible) {
        continue; // on passe à la misison suivante
      }

      const existing_mission = utilisateur.missions.getMissionByCode(
        mission_def.code,
      );

      if (existing_mission) {
        if (exclude_done && existing_mission.isDone()) {
          // SKIP
        } else {
          result.push(
            TuileMission.newFromMissionANDMissionDefinition(
              existing_mission,
              mission_def,
            ),
          );
        }
      } else {
        result.push(TuileMission.newFromMissionDefinition(mission_def));
      }
    }
    return this.ordonneTuilesMission(result);
  }

  async terminerMissionByCode(
    utilisateurId: string,
    code_mission: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.missions, Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    let mission = utilisateur.missions.getMissionByCode(code_mission);

    if (!mission) {
      ApplicationError.throwMissionNotFoundOfCode(code_mission);
    }
    if (mission.estTerminable()) {
      mission.terminer(utilisateur);
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }

  async getMissionByCode(
    utilisateurId: string,
    code_mission: string,
  ): Promise<Mission> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.missions, Scope.logement, Scope.defis],
    );
    Utilisateur.checkState(utilisateur);

    let mission_resultat = utilisateur.missions.getMissionByCode(code_mission);

    if (!mission_resultat || mission_resultat.isNew()) {
      const mission_def = MissionRepository.getByCode(code_mission);
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

    if (!mission_resultat) {
      throw ApplicationError.throwMissionNotFoundOfCode(code_mission);
    }

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
  }

  async gagnerPointsDeObjectif(utilisateurId: string, objectifId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.missions,
        Scope.gamification,
        Scope.kyc,
        Scope.history_article_quizz,
        Scope.defis,
      ],
    );
    Utilisateur.checkState(utilisateur);

    let objectifs_target: Objectif[] = [];

    for (const mission of utilisateur.missions.missions) {
      if (mission.isNew()) {
        continue; // on zap, on peut pas gagner des pts sur quoi que ce soit d'une mission pas commencée
      }
      const objectif_courant = mission.findObjectifByTechId(objectifId);
      if (objectif_courant && objectif_courant.type === ContentType.kyc) {
        objectifs_target = objectifs_target.concat(
          mission.getAllKYCsandMosaics(),
        );
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

  async getMissionKYCsAndMosaicsByCodeMission(
    utilisateurId: string,
    code_mission: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.missions, Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.kyc_history.setCatalogue(KycRepository.getCatalogue());

    const mission = utilisateur.missions.getMissionByCode(code_mission);

    if (!mission) {
      throw ApplicationError.throwMissionNotFoundOfCode(code_mission);
    }

    const result: QuestionKYC[] = [];

    const liste_objectifs_kyc = mission.getAllKYCsandMosaics();

    for (const objectif_kyc of liste_objectifs_kyc) {
      if (objectif_kyc.type === ContentType.kyc) {
        const kyc = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          objectif_kyc.content_id,
        );
        if (kyc) {
          result.push(kyc);
        }
      } else {
        const mosaic = utilisateur.kyc_history.getUpToDateMosaicById(
          KYCMosaicID[objectif_kyc.content_id],
        );
        if (mosaic) {
          result.push(mosaic);
        }
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
    ]);
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

  public ordonneTuilesMission<T extends PriorityContent>(liste: T[]): T[] {
    const first = liste.find((t) => t.is_first);
    if (first) {
      return [first].concat(liste.filter((t) => !t.is_first));
    } else {
      return liste;
    }
  }
}
