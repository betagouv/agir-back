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
          titre: this.getTitre(ThematiqueUnivers.manger_saison),
          type: ThematiqueUnivers.manger_saison,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
          image_url: this.getImageUrl(ThematiqueUnivers.manger_saison),
        },
        {
          titre: this.getTitre(ThematiqueUnivers.manger_local),
          type: ThematiqueUnivers.manger_local,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 2,
          image_url: this.getImageUrl(ThematiqueUnivers.manger_local),
        },
        {
          titre: this.getTitre(ThematiqueUnivers.gaspillage_alimentaire),
          type: ThematiqueUnivers.gaspillage_alimentaire,
          progression: 2,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
          image_url: this.getImageUrl(ThematiqueUnivers.gaspillage_alimentaire),
        },
        {
          titre: this.getTitre(ThematiqueUnivers.dechets_compost),
          type: ThematiqueUnivers.dechets_compost,
          progression: 5,
          cible_progression: 7,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 1,
          image_url: this.getImageUrl(ThematiqueUnivers.dechets_compost),
        },
        {
          titre: this.getTitre(ThematiqueUnivers.cereales),
          type: ThematiqueUnivers.cereales,
          progression: 0,
          cible_progression: 10,
          is_locked: true,
          reason_locked: 'Pas prêt à manger de la céréale !',
          is_new: false,
          niveau: 3,
          image_url: this.getImageUrl(ThematiqueUnivers.cereales),
        },
      ];
    if (univers === Univers.transport)
      return [
        {
          titre: this.getTitre(ThematiqueUnivers.mobilite_quotidien),
          type: ThematiqueUnivers.mobilite_quotidien,
          progression: 0,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: true,
          niveau: 1,
          image_url: this.getImageUrl(ThematiqueUnivers.mobilite_quotidien),
        },
        {
          titre: this.getTitre(ThematiqueUnivers.partir_vacances),
          type: ThematiqueUnivers.partir_vacances,
          progression: 2,
          cible_progression: 5,
          is_locked: false,
          reason_locked: null,
          is_new: false,
          niveau: 2,
          image_url: this.getImageUrl(ThematiqueUnivers.partir_vacances),
        },
      ];
    return [
      {
        titre: this.getTitre(ThematiqueUnivers.coming_soon),
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: this.getImageUrl(ThematiqueUnivers.coming_soon),
      },
      {
        titre: this.getTitre(ThematiqueUnivers.coming_soon),
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: this.getImageUrl(ThematiqueUnivers.coming_soon),
      },
      {
        titre: this.getTitre(ThematiqueUnivers.coming_soon),
        type: ThematiqueUnivers.coming_soon,
        progression: 0,
        cible_progression: 5,
        is_locked: true,
        reason_locked: 'Bientôt dans les bacs',
        is_new: true,
        niveau: 1,
        image_url: this.getImageUrl(ThematiqueUnivers.coming_soon),
      },
    ];
  }

  private getTitre(th: ThematiqueUnivers) {
    const tuile = ThematiqueRepository.getTuileThematique(th);
    return tuile ? tuile.titre : 'Titre manquant';
  }
  private getImageUrl(th: ThematiqueUnivers) {
    const tuile = ThematiqueRepository.getTuileThematique(th);
    return tuile
      ? tuile.image_url
      : 'https://res.cloudinary.com/dq023imd8/image/upload/v1714635448/univers_climat_a7bedede79.jpg';
  }
}
