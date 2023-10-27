import { Injectable } from '@nestjs/common';
import codes_postaux from './codes_postaux.json';

export type Commune = {
  INSEE: string;
  commune: string;
  acheminement: string;
  Ligne_5: string;
};

@Injectable()
export class CommuneRepository {
  constructor() {
    this.supprimernDoublonsCommunesEtLigne5(codes_postaux);
  }

  supprimernDoublonsCommunesEtLigne5(referentiel) {
    for (const code_postal in referentiel) {
      let commune_map = new Map<string, Commune>();
      referentiel[code_postal].forEach((current_commune: Commune) => {
        delete current_commune.Ligne_5;
        commune_map.set(current_commune.commune, current_commune);
      });
      referentiel[code_postal] = [...commune_map.values()];
    }
  }

  checkCodePostal(code_postal: string): boolean {
    return codes_postaux[code_postal] !== undefined;
  }

  getListCommunesParCodePostal(code_postal: string): string[] {
    const liste: Commune[] = codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.commune);
  }
}
