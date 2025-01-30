import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
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
import { TuileMission } from '../domain/thematique/tuileMission';
import { Thematique } from '../domain/contenu/thematique';
import { PriorityContent } from '../domain/scoring/priorityContent';
import { Article } from '../domain/contenu/article';

@Injectable()
export class MissionUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private personnalisator: Personnalisator,
    private articleRepository: ArticleRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async listUsersWithMissionDoneByCode(
    code_mission: string,
  ): Promise<{ id: string; email: string }[]> {
    const result: { id: string; email: string }[] = [];

    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds({
      is_active: true,
    });

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, [
        Scope.missions,
      ]);
      const mission = utilisateur.missions.getMissionByCode(code_mission);
      if (mission && mission.isDone()) {
        result.push({ id: utilisateur.id, email: utilisateur.email });
      }
    }

    return result;
  }

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

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.missions],
    );

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

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.missions],
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
      if (!mission_def.est_visible && !utilisateur.isAdmin()) {
        continue; // on passe à la misison suivante
      }

      const existing_mission = utilisateur.missions.getMissionByCode(
        mission_def.code,
      );

      if (existing_mission) {
        if (existing_mission.estTerminable() && !existing_mission.isDone()) {
          existing_mission.terminer();
        }
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
      mission.terminer();
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }

  async getMissionByCode(
    utilisateurId: string,
    code_mission: string,
  ): Promise<Mission> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.missions,
        Scope.logement,
        Scope.defis,
        Scope.history_article_quizz_aides,
      ],
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

    mission_resultat.quizz_global_score =
      mission_resultat.getGlobalQuizzPourcent(utilisateur);

    if (mission_resultat.estTerminable() && !mission_resultat.isDone()) {
      mission_resultat.terminer();
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
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
        Scope.history_article_quizz_aides,
        Scope.defis,
      ],
    );
    Utilisateur.checkState(utilisateur);

    let objectifs_target: Objectif[] = [];

    for (const mission of utilisateur.missions.getRAWMissions()) {
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

  private async completeMissionDef(
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
        const article_def_candidat_liste =
          await this.articleRepository.searchArticles(filtre);

        const article_candidat_liste = article_def_candidat_liste.map(
          (a) => new Article(a),
        );

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
