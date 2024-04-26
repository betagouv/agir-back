import { Injectable } from '@nestjs/common';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';
import { ThematiqueUniversType } from '../../src/domain/univers/thematiqueUniversType';
import { Univers } from '../../src/domain/univers/univers';
import { UniversType } from '../../src/domain/univers/universType';

@Injectable()
export class UniversUsecase {
  constructor() {}

  async getALLOfUser(utilisateurId: string): Promise<Univers[]> {
    return [
      {
        etoiles: 5,
        is_locked: false,
        reason_locked: null,
        titre: 'Le climat',
        type: UniversType.climat,
      },
      {
        etoiles: 0,
        is_locked: false,
        reason_locked: null,
        titre: 'En cuisine',
        type: UniversType.cuisine,
      },
      {
        etoiles: 8,
        is_locked: false,
        reason_locked: null,
        titre: 'Les transports',
        type: UniversType.transports,
      },
      {
        etoiles: 9,
        is_locked: false,
        reason_locked: null,
        titre: 'À la maison',
        type: UniversType.maison,
      },
      {
        etoiles: 8,
        is_locked: false,
        reason_locked: null,
        titre: 'Shopping',
        type: UniversType.shopping,
      },
      {
        etoiles: 12,
        is_locked: true,
        reason_locked: 'Pour quand tu seras fort !',
        titre: 'Les vacances',
        type: UniversType.vacances,
      },
    ];
  }
  async getThematiquesOfUnivers(
    utilisateurId: string,
    universType: UniversType,
  ): Promise<ThematiqueUnivers[]> {
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
        titre: 'Déchts et compost',
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
  }
}
