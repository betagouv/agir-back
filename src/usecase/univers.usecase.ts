import { Injectable } from '@nestjs/common';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { TuileThematique } from '../domain/univers/tuileThematique';
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
    const list = ThematiqueRepository.getTuileThematiques(univers);
    list.forEach((element) => {
      element.cible_progression = 5;
      element.is_locked = false;
      element.is_new = true;
      element.niveau = 1;
      element.progression = 0;
    });
    return list;
  }
}
