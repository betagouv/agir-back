import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
import { TuileUnivers } from '../domain/univers/tuileUnivers';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission, Objectif } from '../../src/domain/mission/mission';
import {
  MissionDefinition,
  ObjectifDefinition,
} from '../domain/mission/missionDefinition';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { Categorie } from '../domain/contenu/categorie';
import { ContentType } from '../domain/contenu/contentType';
import { PonderationApplicativeManager } from '../domain/scoring/ponderationApplicative';

@Injectable()
export class UniversUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private articleRepository: ArticleRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async getALL(utilisateurId: string): Promise<TuileUnivers[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let tuiles = ThematiqueRepository.getAllTuileUnivers();
    tuiles = tuiles.map((t) => new TuileUnivers(t));

    if (!utilisateur.parcours_todo.isLastTodo()) {
      for (const t of tuiles) {
        t.is_locked = true;
      }
      return tuiles;
    }

    let result: TuileUnivers[] = [];

    result = result.concat(tuiles.filter((t) => !t.is_locked));
    result = result.concat(tuiles.filter((t) => t.is_locked));

    for (const univers of result) {
      univers.is_done = utilisateur.missions.isUniversDone(univers.type);
    }

    return result;
  }

  async getThematiquesOfUnivers(
    utilisateurId: string,
    univers: string,
  ): Promise<TuileThematique[]> {
    // FIXME : refacto , code tout moche en dessous
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const listTuilesThem = ThematiqueRepository.getAllTuilesThematique(univers);

    const listMissionDefs = await this.missionRepository.list();

    const result: TuileThematique[] = [];

    for (const tuile of listTuilesThem) {
      const existing_mission =
        utilisateur.missions.getMissionByThematiqueUnivers(tuile.type);

      if (existing_mission && existing_mission.est_visible) {
        result.push(this.completeTuileWithMission(existing_mission, tuile));
      } else {
        for (const mission_def of listMissionDefs) {
          if (
            (mission_def.est_visible || utilisateur.isAdmin()) &&
            mission_def.thematique_univers === tuile.type &&
            ThematiqueRepository.getUniversParent(
              mission_def.thematique_univers,
            ) === univers
          ) {
            const ready_mission_def = await this.completeMissionDef(
              mission_def,
              utilisateur,
            );

            const new_mission =
              utilisateur.missions.addMission(ready_mission_def);

            result.push(this.completeTuileWithMission(new_mission, tuile));
          }
        }
      }
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.ordonneTuilesThematiques(result);
  }

  private completeTuileWithMission(
    mission: Mission,
    tuile: TuileThematique,
  ): TuileThematique {
    return new TuileThematique({
      image_url: tuile.image_url,
      is_locked: false,
      is_new: mission.isNew(),
      niveau: tuile.niveau,
      reason_locked: null,
      type: tuile.type,
      titre: ThematiqueRepository.getTitreThematiqueUnivers(
        mission.thematique_univers,
      ),
      progression: mission.getProgression().current,
      cible_progression: mission.getProgression().target,
      univers_parent: tuile.univers_parent,
      univers_parent_label: tuile.univers_parent_label,
      famille_id_cms: tuile.famille_id_cms,
      famille_ordre: tuile.famille_ordre,
    });
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
            id_cms: objectif.id_cms,
          });
          mission_def.objectifs.push(new_objectif);
        }
      } else {
        mission_def.objectifs.push(objectif);
      }
    }
    return mission_def;
  }

  public ordonneTuilesThematiques(liste: TuileThematique[]): TuileThematique[] {
    liste.sort((a, b) => a.famille_ordre - b.famille_ordre);

    let famille_map: Map<Number, TuileThematique[]> = new Map();

    for (const tuile of liste) {
      const famille = famille_map.get(tuile.famille_ordre);
      if (famille) {
        famille.push(tuile);
      } else {
        famille_map.set(tuile.famille_ordre, [tuile]);
      }
    }

    let result = [];

    for (const [key] of famille_map) {
      famille_map.get(key).sort((a, b) => a.niveau - b.niveau);
      result = result.concat(famille_map.get(key));
    }
    return result;
  }
}
