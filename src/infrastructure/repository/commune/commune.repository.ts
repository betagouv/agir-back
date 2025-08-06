import _communes from '@etalab/decoupage-administratif/data/communes.json';
import _departements from '@etalab/decoupage-administratif/data/departements.json';
import _epci from '@etalab/decoupage-administratif/data/epci.json';
import _regions from '@etalab/decoupage-administratif/data/regions.json';
import { Injectable } from '@nestjs/common';
import { CommunesAndEPCI } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import _codes_postaux from './codes_postaux.json';
import _typologie_communes from './typologie_communes.json';

const typologie_communes_by_code_insee = _typologie_communes as Record<
  string,
  TypologieCommune
>;

const communes = _communes as Commune[];
const epci = _epci as EPCI[];

const map_code_commune_nom_uppercase: Map<string, string> = new Map();

for (const liste_communes of Object.values(_codes_postaux)) {
  const liste = liste_communes as CommuneParCodePostal[];
  for (const elem of liste) {
    map_code_commune_nom_uppercase.set(elem.INSEE, elem.commune);
  }
}

/** Associate each commune INSEE code to its EPCI SIREN code. */
const communesEPCI = Object.fromEntries(
  _epci.flatMap((epci) => epci.membres.map(({ code }) => [code, epci.code])),
);

export enum TypeCommune {
  Urbain = 'Urbain',
  Rural = 'Rural',
  'Péri-urbain' = 'Péri-urbain',
}
export type TypologieCommune = {
  Ville: string;
  Classification: TypeCommune;
  CATEAAV2020: number;
  TAAV2017: number;
  DROM: number;
};

export type CommuneParCodePostal = {
  // NOTE: Le code INSEE peut correspondre dans certains cas au code INSEE de
  // l'arrondissement et non de la commune (ex. Lyon 06).
  INSEE: string;
  commune: string;
  acheminement: string;
  Ligne_5: string;
};

export type Region = {
  code: string;
  nom: string;
};

export type Departement = {
  code: string;
  nom: string;
};

/**
 * NOTE: this type has been inferred from the
 * @etalab/decoupage-administratif/data/communes.json file  by running 'fx
 * @.<key> uniq sort' on the data. Therefore, there is no guarantee that in
 * future versions of the data, the keys will remain the same.
 */
export type Commune = {
  /** The INSEE code of the commune (e.g. "75056"). */
  code: string;
  commune: string;
  nom: string;
  typeLiaison?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  zone: 'metro' | 'drom' | 'com';
  arrondissement?: string;
  departement: string;
  region: string;
  type:
    | 'commune-actuelle'
    | 'commune-deleguee'
    | 'commune-associee'
    | 'arrondissement-municipal';
  rangChefLieu?: 0;
  siren?: string;
  codesPostaux?: string[];
  population?: number;
};

/**
 * NOTE: this type has been inferred from the
 * @etalab/decoupage-administratif/data/epci.json file  by running 'fx @.<key>
 * uniq sort' on the data. Therefore, there is no guarantee that in future
 * versions of the data, the keys will remain the same.
 */
export type EPCI = {
  /** The SIREN code of the EPCI (e.g. "200000172"). */
  code: string;
  /** The name of the EPCI (e.g. "CC Faucigny - Glières"). */
  nom: string;
  /** The type of the EPCI (i.e. "Communauté d'agglomération", "Communauté de communes", ...). */
  type: 'CA' | 'CC' | 'CU' | 'MET69' | 'METRO';
  modeFinancement: 'FA' | 'FPU';
  populationTotale: number;
  populationMunicipale: number;
  membres: Array<
    Pick<Commune, 'code' | 'siren' | 'nom'> & {
      populationTotale: number;
      populationMunicipale: number;
    }
  >;
};

@Injectable()
export class CommuneRepository {
  constructor(private prisma: PrismaService) {
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

  /**
   * Get the EPCI by its SIREN code.
   *
   * @param code The SIREN code of the EPCI (e.g. "200000172").
   * @returns The EPCI if found, `undefined` otherwise.
   *
   * PERF: could we use a more clever data structure to have a O(1) lookup?
   */
  public getEPCIBySIRENCode(code: string): EPCI | undefined {
    return epci.find((e) => e.code === code);
  }

  public async findCommuneOrEpciByName(names: string[]): Promise<
    {
      code_insee: string;
      nom: string;
    }[]
  > {
    let query = `
    SELECT
      "nom",
      "code_insee"
    FROM
      "CommunesAndEPCI"
    WHERE
    `;

    for (let index = 0; index < names.length; index++) {
      const name = names[index];
      if (index > 0) {
        query += ' AND ';
      }
      query += `"nom" ILIKE '%${name}%'`;
    }
    query += ' ; ';

    const result: { nom: string; code_insee: string }[] =
      await this.prisma.$queryRawUnsafe(query);
    return result;
  }
  public async upsertCommuneAndEpciToDatabase() {
    for (const une_epci of epci) {
      const codes_postaux = new Set<string>();
      for (const membre of une_epci.membres) {
        const codes = this.getCodePostauxFromCodeCommune(membre.code);
        for (const code_postal of codes) {
          codes_postaux.add(code_postal);
        }
      }
      await this.upsertEPCI(
        une_epci.nom,
        une_epci.code,
        Array.from(codes_postaux.values()),
        une_epci.membres.map((m) => m.code),
        une_epci.type,
      );
    }

    for (const une_commune of communes) {
      await this.upsertCommune(
        une_commune.nom,
        une_commune.code,
        une_commune.codesPostaux,
      );
    }
  }

  public getNiveauUrbainCommune(code_commune: string): TypeCommune {
    return typologie_communes_by_code_insee[code_commune]?.Classification;
  }

  private async upsertCommune(
    nom: string,
    code_insee: string,
    codes_postaux: string[],
  ) {
    const data: CommunesAndEPCI = {
      code_insee: code_insee,
      nom: nom,
      code_postaux: codes_postaux,
      codes_communes: [],
      is_commune: true,
      is_epci: false,
      type_epci: undefined,
    };
    await this.prisma.communesAndEPCI.upsert({
      where: {
        code_insee: code_insee,
      },
      create: data,
      update: data,
    });
  }
  private async upsertEPCI(
    nom: string,
    code_insee: string,
    codes_postaux: string[],
    codes_communes: string[],
    type_epci: string,
  ) {
    const data: CommunesAndEPCI = {
      code_insee: code_insee,
      nom: nom,
      code_postaux: codes_postaux,
      codes_communes: codes_communes,
      is_commune: false,
      is_epci: true,
      type_epci: type_epci,
    };
    await this.prisma.communesAndEPCI.upsert({
      where: {
        code_insee: code_insee,
      },
      create: data,
      update: data,
    });
  }

  public getNomDepartementByCode(code: string): string {
    const result = (_departements as Departement[]).find(
      (d) => d.code === code,
    );
    return result ? result.nom : 'INCONNU';
  }

  // NOTE: why some methods are public and some are protected?
  public getNomRegionByCode(code: string): string {
    const result = (_regions as Region[]).find((d) => d.code === code);
    return result ? result.nom : 'INCONNU';
  }

  public static checkCodePostal(code_postal: string): boolean {
    return _codes_postaux[code_postal] !== undefined;
  }

  // PERF: could we use a more clever data structure to have a O(1) lookup?
  isCodeSirenEPCI(code_siren: string): boolean {
    return epci.find((e) => e.code === code_siren) != undefined;
  }

  checkOKCodePostalAndCommune(code_postal: string, commune: string): boolean {
    const liste_communes = this.getListNomsCommunesParCodePostal(code_postal);
    return liste_communes.length !== 0 && liste_communes.includes(commune);
  }

  getListNomsCommunesParCodePostal(code_postal: string): string[] {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.commune);
  }
  getListCommunesParCodePostal(
    code_postal: string,
  ): { code: string; label: string }[] {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => ({
      code: a.INSEE,
      label: a.commune,
    }));
  }

  getListCodesCommunesParCodePostal(code_postal: string): string[] {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.INSEE);
  }

  static getLibelleCommuneLowerCase(code_insee: string) {
    const commune = communes.find((c) => c.code === code_insee);
    if (commune) {
      return commune.nom;
    }
    return null;
  }

  // FIXME : fonction à supprimer
  static getLibelleCommuneUpperCase(code_insee: string) {
    return map_code_commune_nom_uppercase.get(code_insee);
  }

  // FIXME: the [utilisateur.logement.commune] doesn't correspond anymore to the
  // "commune" field in `_codes_postaux`.
  // FIXME : fonction à supprimer
  public static getCodeCommuneFromCodePostalEtNomCommune(
    code_postal: string,
    nom_commune: string,
  ): string | null {
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

  public static getCommune;

  listeCodesCommunesByEPCICode(code_epci: string): string[] {
    const the_epci = this.getEPCIBySIRENCode(code_epci);
    const result = [];

    for (const membre of the_epci.membres) {
      result.push(membre.code);
    }

    return result;
  }

  findRaisonSocialeDeNatureJuridiqueByCodePostal(
    code_postal: string,
    echelon: EPCI['type'],
  ): string[] {
    const liste_communes = this.getCommunesForCodePostal(code_postal);
    const result = new Set<string>();

    for (const commune of liste_communes) {
      const epciCode = communesEPCI[commune.INSEE];
      if (!epciCode) {
        continue;
      }

      const epci = this.getEPCIBySIRENCode(epciCode);
      if (epci?.type === echelon) {
        result.add(epci.nom);
      }
    }

    return Array.from(result.values());
  }

  public estCommuneMembreDeEPCI(
    code_commune: string,
    code_epci: string,
  ): boolean {
    const epci = this.getEPCIBySIRENCode(code_epci);
    if (epci) {
      return epci.membres.findIndex((c) => c.code === code_commune) >= 0;
    }
    return false;
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
      for (const commune_insee of communes) {
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

  public static findDepartementRegionByCodeCommune(code_commune: string): {
    code_departement: string;
    code_region: string;
  } {
    if (!code_commune) return undefined;

    let commune = communes.find((c) => c.code === code_commune);

    if (commune) {
      return {
        code_departement: commune.departement,
        code_region: commune.region,
      };
    } else {
      return undefined;
    }
  }

  getListeCodesCommuneParCodeEPCI(code_EPCI: string): string[] {
    for (const une_epci of epci) {
      if (une_epci.code === code_EPCI) {
        return une_epci.membres.map((m) => m.code);
      }
    }
    return [];
  }

  public getCommunesForCodePostal(code_postal: string) {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    return liste ? liste : [];
  }

  public getCodePostauxFromCodeCommune(code_commune: string) {
    for (const une_commune of communes) {
      if (une_commune.code === code_commune) {
        return une_commune.codesPostaux;
      }
    }
    return [];
  }

  public estDromCom(code_commune: string): boolean {
    if (!code_commune) return false;
    const commune = this.getCommuneByCodeINSEE(code_commune);
    if (!commune) return false;
    return commune.zone === 'com' || commune.zone === 'drom';
  }

  /**
   * Get the commune OR A DISTRICT by its INSEE code.
   *
   * @param inseeCode The INSEE code of the commune (e.g. "75056").
   * @returns The commune if found, `undefined` otherwise.
   *
   * @note The INSEE code is not the same as the postal code. It's a unique
   * identifier for each commune in France in contrast to the postal code which
   * can be shared by multiple communes.
   */
  getCommuneByCodeINSEE(code_insee: string): Commune | undefined {
    return CommuneRepository.getCommuneByCodeINSEE_static(code_insee);
  }

  // FIXME : passer tout en static, re - intégrer ce faux repository dans le domaine
  public static getCommuneByCodeINSEE_static(
    code_insee: string,
  ): Commune | undefined {
    return communes.find((c) => c.code === code_insee);
  }

  /**
   * Returns the commune by its INSEE code. If the INSEE code refers to an
   * arrondissement municipal, it will return the corresponding
   * commune.
   *
   * @param code_insee The INSEE code of the commune (e.g. "75056").
   * @returns The commune if found, `undefined` otherwise.
   *
   * @example
   * const commune = getCommuneByCodeINSEE('69386'); // 'Lyon 6e arrondissement'
   * commune.code; // '69123' (lyon)
   */
  getCommuneByCodeINSEESansArrondissement(
    code_insee: string,
  ): Commune | undefined {
    const commune = this.getCommuneByCodeINSEE(code_insee);
    if (commune === undefined) {
      return undefined;
    }

    return commune.type === 'arrondissement-municipal'
      ? this.getCommuneByCodeINSEE(commune.commune)
      : commune;
  }

  /**
   * Returns the EPCI of the commune identified by its INSEE code.
   *
   * @param code_insee The INSEE code of the commune (e.g. "75056").
   * @returns The EPCI if found, `undefined` otherwise.
   *
   * @note This method expects that the INSEE code corresponds to a commune and
   * not an arrondissement. Use {@link getCommuneByCodeINSEESansArrondissement}
   * if you want to get the commune without arrondissement.
   */
  getEPCIByCommuneCodeINSEE(code_insee: string): EPCI | undefined {
    const epciCode = communesEPCI[code_insee];
    return this.getEPCIBySIRENCode(epciCode);
  }
}
