import { Injectable } from '@nestjs/common';
import _codes_postaux from './codes_postaux.json';
import _epiccom from './epicom2024.json';
/**
 * NOTE: Initially, a 'communes.json' file was used to store the commune data.
 * It was copied from the mquendal/mesaidesvelo repository. However, as we
 * created a dedicated package (@betagouv/aides-velo) to isolate the logic and
 * generate the 'communes.json' file, we use it as a source of truth for the
 * commune data.
 *
 * NOTE: We should consider at some point to create a standalone package for
 * the commune data and use it as a source of truth for all the packages that
 * need it with extra utilities to manipulate the data or decide to directly
 * use the @etalab/decoupage-administratif package.
 */
import { data as aidesVeloData } from '@betagouv/aides-velo';

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
  epci?: string;
  codesPostaux: string[];
};

export type EpicCom = {
  dept: string;
  siren: string;
  raison_sociale: string;
  nature_juridique: string;
  mode_financ: string;
  dep_com: string;
  insee: string;
  nom_membre: String;
};

@Injectable()
export class CommuneRepository {
  constructor() {
    this.supprimernDoublonsCommunesEtLigne5(_codes_postaux);
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
    return _codes_postaux[code_postal] !== undefined;
  }

  checkOKCodePostalAndCommune(code_postal: string, commune: string): boolean {
    const liste_communes = this.getListCommunesParCodePostal(code_postal);
    return liste_communes.length !== 0 && liste_communes.includes(commune);
  }

  getListCommunesParCodePostal(code_postal: string): string[] {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
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
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
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

  formatCommune(code_postal: string, commune: string): string {
    if (code_postal === null) return null;

    const code_insee = this.getCodeCommune(code_postal, commune);
    const libelle = this.getLibelleCommuneLowerCase(code_insee);
    return libelle || commune;
  }

  findRaisonSocialeDeNatureJuridiqueByCodePostal(
    code_postal: string,
    echelon: 'CC' | 'CA' | 'METRO' | 'CU',
  ): string[] {
    const liste_communes = this.getCommunesForCodePostal(code_postal);
    const result = new Set<string>();

    for (const commune of liste_communes) {
      for (const epicom of _epiccom as EpicCom[]) {
        if (
          epicom.insee === commune.INSEE &&
          epicom.nature_juridique === echelon
        ) {
          result.add(epicom.raison_sociale);
        }
      }
    }
    return Array.from(result.values());
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

    let commune = this.getCommuneByCodeINSEE(liste[0].INSEE);
    if (!commune) {
      for (const commune_insee of aidesVeloData.communes) {
        if (commune_insee.codesPostaux.includes(code_postal)) {
          commune = commune_insee;
          break;
        }
      }
    }

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
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    return liste ? liste : [];
  }

  private getCommuneByCodeINSEE(code_insee: string): Commune {
    return aidesVeloData.communes.find((c) => c.code === code_insee);
  }
}
