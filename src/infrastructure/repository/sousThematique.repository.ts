import { Injectable } from '@nestjs/common';
import { SousThematique } from '../../domain/thematique/sousThematique';

@Injectable()
export class SousThematiqueRepository {
  private static labels: Map<SousThematique, string>;

  constructor() {
    SousThematiqueRepository.labels = new Map();
    SousThematiqueRepository.labels.set(
      SousThematique.logement_economie_energie,
      "Faire des économies d'énergie",
    );
    SousThematiqueRepository.labels.set(
      SousThematique.logement_risque_naturel,
      'Les risques naturels',
    );
  }

  public static getLabel(sous: SousThematique): string {
    return this.labels.get(sous);
  }
}
