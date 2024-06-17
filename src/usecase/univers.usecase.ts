import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
import { TuileUnivers } from '../domain/univers/tuileUnivers';
import { MissionRepository } from '../../src/infrastructure/repository/mission.repository';

@Injectable()
export class UniversUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private missionRepository: MissionRepository,
  ) {}

  async getALL(): Promise<TuileUnivers[]> {
    let result = [];
    const tuiles = ThematiqueRepository.getAllTuileUnivers();
    result = result.concat(tuiles.filter((t) => !t.is_locked));
    result = result.concat(tuiles.filter((t) => t.is_locked));
    return result;
  }

  async getThematiquesOfUnivers(
    utilisateurId: string,
    univers: string,
  ): Promise<TuileThematique[]> {
    // FIXME : refacto , code tout moche en dessous
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const listTuilesThem = ThematiqueRepository.getAllTuilesThematique(univers);

    const listMissionDefs = await this.missionRepository.list();

    const result: TuileThematique[] = [];

    listTuilesThem.forEach((tuile) => {
      const existing_mission =
        utilisateur.missions.getMissionByThematiqueUnivers(tuile.type);

      if (existing_mission && existing_mission.est_visible) {
        result.push(
          new TuileThematique({
            image_url: tuile.image_url,
            is_locked: false,
            is_new: existing_mission.isNew(),
            niveau: tuile.niveau,
            reason_locked: null,
            type: tuile.type,
            titre: ThematiqueRepository.getTitreThematiqueUnivers(
              existing_mission.thematique_univers,
            ),
            progression: existing_mission.getProgression().current,
            cible_progression: existing_mission.getProgression().target,
            univers_parent: tuile.univers_parent,
            univers_parent_label: tuile.univers_parent_label,
            famille_id_cms: tuile.famille_id_cms,
            famille_ordre: tuile.famille_ordre,
          }),
        );
      } else {
        listMissionDefs.forEach((mission_def) => {
          if (
            mission_def.est_visible &&
            mission_def.thematique_univers === tuile.type &&
            ThematiqueRepository.getUniversParent(
              mission_def.thematique_univers,
            ) === univers
          ) {
            result.push(
              new TuileThematique({
                image_url: tuile.image_url,
                is_locked: false,
                is_new: true,
                niveau: tuile.niveau,
                reason_locked: null,
                type: tuile.type,
                titre: tuile.titre,
                progression: 0,
                cible_progression: mission_def.objectifs.length,
                univers_parent: tuile.univers_parent,
                univers_parent_label: tuile.univers_parent_label,
                famille_id_cms: tuile.famille_id_cms,
                famille_ordre: tuile.famille_ordre,
              }),
            );
          }
        });
      }
    });

    return this.ordonneTuilesThematiques(result);
  }

  private ordonneTuilesThematiques(
    liste: TuileThematique[],
  ): TuileThematique[] {
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
