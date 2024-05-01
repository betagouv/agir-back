import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
import { ThematiqueUnivers } from '../domain/univers/thematiqueUnivers';
import { TuileUnivers } from '../domain/univers/tuileUnivers';
import { Univers } from '../domain/univers/univers';

@Injectable()
export class UniversUsecase {
  constructor(private thematiqueRepository: ThematiqueRepository) {}

  async getALLOfUser(utilisateurId: string): Promise<TuileUnivers[]> {
    return ThematiqueRepository.getAllTuileUnivers();
  }

  async getThematiquesOfUnivers(
    utilisateurId: string,
    univers: Univers,
  ): Promise<TuileThematique[]> {
    if (univers === Univers.alimentation)
      return [
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.manger_saison,
          ).titre,
          type: ThematiqueUnivers.manger_saison,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.manger_saison,
          ).image_url,
        },
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.manger_local,
          ).titre,
          type: ThematiqueUnivers.manger_local,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 2,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.manger_local,
          ).image_url,
        },
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.gaspillage_alimentaire,
          ).titre,
          type: ThematiqueUnivers.gaspillage_alimentaire,
          progression: 2,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.gaspillage_alimentaire,
          ).image_url,
        },
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.dechets_compost,
          ).titre,
          type: ThematiqueUnivers.dechets_compost,
          progression: 5,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.dechets_compost,
          ).image_url,
        },
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.cereales,
          ).titre,
          type: ThematiqueUnivers.cereales,
          progression: 0,
          cible_progression: 10,
          is_locked: true,
          reason_locked: 'Pas prêt à manger de la céréale !',
          is_new: false,
          niveau: 3,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.cereales,
          ).image_url,
        },
      ];
    if (univers === Univers.transport)
      return [
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.mobilite_quotidien,
          ).titre,
          type: ThematiqueUnivers.mobilite_quotidien,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.mobilite_quotidien,
          ).image_url,
        },
        {
          titre: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.partir_vacances,
          ).titre,
          type: ThematiqueUnivers.partir_vacances,
          progression: 2,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 2,
          image_url: ThematiqueRepository.getTuileThematique(
            ThematiqueUnivers.partir_vacances,
          ).image_url,
        },
      ];
    return [
      {
        titre: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).titre,
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).image_url,
      },
      {
        titre: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).titre,
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).image_url,
      },
      {
        titre: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).titre,
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: ThematiqueRepository.getTuileThematique(
          ThematiqueUnivers.coming_soon,
        ).image_url,
      },
    ];
  }
}
