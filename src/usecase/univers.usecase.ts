import { Injectable } from '@nestjs/common';
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
}
