import { Injectable } from '@nestjs/common';
import codes_postaux from './codes_postaux.json';
import communes from './communes.json';

export type CommuneParCodePostal = {
  INSEE: string;
  commune: string;
  acheminement: string;
  Ligne_5: string;
};

export type Commune = {
  code: string;
  nom: string;
  departement: string;
  region: string;
  population: number;
  zfe: boolean;
  epci: string;
  codesPostaux: string[];
};

@Injectable()
export class CommuneRepository {
  constructor() {
    this.supprimernDoublonsCommunesEtLigne5(codes_postaux);
  }

  supprimernDoublonsCommunesEtLigne5(referentiel) {
    for (const code_postal in referentiel) {
      let commune_map = new Map<string, CommuneParCodePostal>();
      referentiel[code_postal].forEach(
        (current_commune: CommuneParCodePostal) => {
          delete current_commune.Ligne_5;
          commune_map.set(current_commune.commune, current_commune);
        },
      );
      referentiel[code_postal] = [...commune_map.values()];
    }
  }

  checkCodePostal(code_postal: string): boolean {
    return codes_postaux[code_postal] !== undefined;
  }

  getListCommunesParCodePostal(code_postal: string): string[] {
    const liste: CommuneParCodePostal[] = codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.commune);
  }

  getLibelleCommuneLowerCase(code_insee: string) {
    const commune = this.getCommuneByCodeINSEE(code_insee);
    if (commune) {
      return commune.nom;
    }
    return null;
  }

  getCodeCommune(code_postal: string, nom_commune: string): string {
    const liste: CommuneParCodePostal[] = codes_postaux[code_postal];
    if (!liste) {
      return null;
    }
    for (const commune of liste) {
      if (commune.commune === nom_commune) {
        return commune.INSEE;
      }
    }
    return null;
  }

  findDepartementRegionByCodePostal(code_postal: string): {
    code_departement: string;
    code_region: string;
  } {
    const liste = this.getCommunesForCodePostal(code_postal);
    if (liste.length === 0) {
      return {
        code_departement: undefined,
        code_region: undefined,
      };
    }

    const commune = this.getCommuneByCodeINSEE(liste[0].INSEE);

    if (commune) {
      return {
        code_departement: commune.departement,
        code_region: commune.region,
      };
    } else {
      return {
        code_departement: undefined,
        code_region: undefined,
      };
    }
  }

  private getCommunesForCodePostal(code_postal: string) {
    const liste: CommuneParCodePostal[] = codes_postaux[code_postal];
    return liste ? liste : [];
  }

  private getCommuneByCodeINSEE(code_insee: string): Commune {
    return (communes as Commune[]).find((c) => c.code === code_insee);
  }
}
