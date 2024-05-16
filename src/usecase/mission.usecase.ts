import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { ThematiqueUnivers } from '../../src/domain/univers/thematiqueUnivers';

@Injectable()
export class MissionUsecase {
  constructor(private thematiqueRepository: ThematiqueRepository) {}

  async getMissionOfThematique(
    utilisateurId: string,
    thematique: ThematiqueUnivers,
  ): Promise<any> {
    return { titre: 'yo' };
  }
}
