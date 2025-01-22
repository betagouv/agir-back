import { Injectable } from '@nestjs/common';
import _communes from '@etalab/decoupage-administratif/data/communes.json';
import _epci from '@etalab/decoupage-administratif/data/epci.json';
import _codes_postaux from './codes_postaux.json';
import { PrismaService } from '../../prisma/prisma.service';
import { CommunesAndEPCI } from '@prisma/client';

const communes = _communes as Commune[];
const epci = _epci as EPCI[];

/** Associate each commune INSEE code to its EPCI SIREN code. */
const communesEPCI = Object.fromEntries(
  _epci.flatMap((epci) => epci.membres.map(({ code }) => [code, epci.code])),
);

export type CommuneParCodePostal = {
  INSEE: string;
  commune: string;
  acheminement: string;
  Ligne_5: string;
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
  nom: string;
  typeLiaison?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  zone: 'metro' | 'dom' | 'com';
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

  public async findCommuneOrEpciByName(name: string): Promise<
    {
      code_insee: string;
      nom: string;
    }[]
  > {
    const query = `
    SELECT
      "nom",
      "code_insee"
    FROM
      "CommunesAndEPCI"
    WHERE
      "nom" ILIKE '%${name}%'
    ;
    `;
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
  getListCodesCommunesParCodePostal(code_postal: string): string[] {
    const liste: CommuneParCodePostal[] = _codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.INSEE);
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
    echelon: EPCI['type'],
  ): string[] {
    const liste_communes = this.getCommunesForCodePostal(code_postal);
    const result = new Set<string>();

    for (const commune of liste_communes) {
      const epciCode = communesEPCI[commune.INSEE];
      if (!epciCode) {
        continue;
      }

      const epci = this.getEPCI(epciCode);
      if (epci?.type === echelon) {
        result.add(epci.nom);
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

  /**
   * Get the commune by its INSEE code.
   *
   * @param inseeCode The INSEE code of the commune (e.g. "75056").
   * @returns The commune if found, `undefined` otherwise.
   *
   * @note The INSEE code is not the same as the postal code. It's a unique
   * identifier for each commune in France in contrast to the postal code which
   * can be shared by multiple communes.
   */
  getCommuneByCodeINSEE(code_insee: string): Commune | undefined {
    return communes.find((c) => c.code === code_insee);
  }

  /**
   * Returns the EPCI of the commune identified by its INSEE code.
   *
   * @param code_insee The INSEE code of the commune (e.g. "75056").
   * @returns The EPCI if found, `undefined` otherwise.
   */
  getEPCIByCommuneCodeINSEE(code_insee: string): EPCI | undefined {
    const epciCode = communesEPCI[code_insee];
    return this.getEPCI(epciCode);
  }

  /**
   * Returns the EPCI identified by its SIREN code.
   *
   * @param code The SIREN code of the EPCI (e.g. "200000172").
   * @returns The EPCI if found, `undefined` otherwise.
   */
  private getEPCI(code?: string): EPCI | undefined {
    if (code) {
      return epci.find((epci) => epci.code === code);
    }
  }
}
