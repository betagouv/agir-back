import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
import { TuileUnivers } from '../domain/univers/tuileUnivers';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';
import { Mission } from '../../src/domain/mission/mission';
import { MissionUsecase } from './mission.usecase';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';

@Injectable()
export class UniversUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
    private missionUsecase: MissionUsecase,
    private personnalisator: Personnalisator,
  ) {}

  async getALL(utilisateurId: string): Promise<TuileUnivers[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let tuiles = ThematiqueRepository.getAllTuileUnivers();
    tuiles = tuiles.map((t) => new TuileUnivers(t));

    const blocked_univers = !utilisateur.parcours_todo.isEndedTodo();
    for (const t of tuiles) {
      t.is_locked = blocked_univers;
    }

    if (!blocked_univers) {
      for (const univers of tuiles) {
        univers.is_done = utilisateur.missions.isUniversDone(univers.type);
      }
    }

    return this.personnalisator.personnaliser(tuiles, utilisateur);
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
            const ready_mission_def =
              await this.missionUsecase.completeMissionDef(
                mission_def,
                utilisateur,
              );

            const new_mission =
              utilisateur.missions.upsertNewMission(ready_mission_def);

            result.push(this.completeTuileWithMission(new_mission, tuile));
          }
        }
      }
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    const final_result = this.ordonneTuilesThematiques(result);

    return this.personnalisator.personnaliser(final_result, utilisateur);
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
