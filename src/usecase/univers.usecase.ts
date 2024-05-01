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
    return ThematiqueRepository.getAllUnivers();
  }

  async getThematiquesOfUnivers(
    utilisateurId: string,
    univers: Univers,
  ): Promise<TuileThematique[]> {
    if (univers === Univers.cuisine)
      return [
        {
          titre: 'Manger de saison',
          type: ThematiqueUnivers.manger_saison,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
        },
        {
          titre: 'Manger local',
          type: ThematiqueUnivers.manger_local,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 2,
        },
        {
          titre: 'Le gaspillage alimentaire',
          type: ThematiqueUnivers.gaspillage_alimentaire,
          progression: 2,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
        },
        {
          titre: 'Déchets et compost',
          type: ThematiqueUnivers.dechets_compost,
          progression: 5,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
        },
        {
          titre: 'La force des céréales',
          type: ThematiqueUnivers.cereales,
          progression: 0,
          cible_progression: 10,
          is_locked: true,
          reason_locked: 'Pas prêt à manger de la céréale !',
          is_new: false,
          niveau: 3,
        },
      ];
    if (univers === Univers.transports)
      return [
        {
          titre: 'La mobilité du quotidien',
          type: ThematiqueUnivers.mobilite_quotidien,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
        },
        {
          titre: 'Partir en vacances',
          type: ThematiqueUnivers.partir_vacances,
          progression: 2,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
        },
      ];
    return [
      {
        titre: 'Coming soon !',
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
      },
      {
        titre: 'Coming soon !',
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
      },
      {
        titre: 'Coming soon !',
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
      },
    ];
  }
}
