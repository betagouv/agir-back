import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { ThematiqueUniversType } from '../../src/domain/univers/thematiqueUniversType';
import { Univers } from '../../src/domain/univers/univers';
import { UniversType } from '../../src/domain/univers/universType';

@Injectable()
export class UniversUsecase {
  constructor(private thematiqueRepository: ThematiqueRepository) {}

  async getALLOfUser(utilisateurId: string): Promise<Univers[]> {
    return ThematiqueRepository.getAllUnivers();
  }

  async getThematiquesOfUnivers(
    utilisateurId: string,
    universType: UniversType,
  ): Promise<ThematiqueUnivers[]> {
    if (universType === UniversType.cuisine)
      return [
        {
          titre: 'Manger de saison',
          type: ThematiqueUniversType.manger_saison,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
        },
        {
          titre: 'Manger local',
          type: ThematiqueUniversType.manger_local,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 2,
        },
        {
          titre: 'Le gaspillage alimentaire',
          type: ThematiqueUniversType.gaspillage_alimentaire,
          progression: 2,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
        },
        {
          titre: 'Déchets et compost',
          type: ThematiqueUniversType.dechets_compost,
          progression: 5,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
        },
        {
          titre: 'La force des céréales',
          type: ThematiqueUniversType.cereales,
          progression: 0,
          cible_progression: 10,
          is_locked: true,
          reason_locked: 'Pas prêt à manger de la céréale !',
          is_new: false,
          niveau: 3,
        },
      ];
    if (universType === UniversType.transports)
      return [
        {
          titre: 'La mobilité du quotidien',
          type: ThematiqueUniversType.mobilite_quotidien,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
        },
        {
          titre: 'Partir en vacances',
          type: ThematiqueUniversType.partir_vacances,
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
        type: ThematiqueUniversType.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
      },
      {
        titre: 'Coming soon !',
        type: ThematiqueUniversType.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
      },
      {
        titre: 'Coming soon !',
        type: ThematiqueUniversType.coming_soon,
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
