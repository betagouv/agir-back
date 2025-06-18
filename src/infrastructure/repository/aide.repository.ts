import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Aide as AideDB } from '@prisma/client';
import { AideDefinition } from '../../domain/aides/aideDefinition';
import { Echelle } from '../../domain/aides/echelle';
import { App } from '../../domain/app';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

export type AideFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  besoins?: string[];
  code_postal?: string;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
  echelle?: Echelle;
  date_expiration?: Date;
  commune_pour_partenaire?: string;
  region_pour_partenaire?: string;
  departement_pour_partenaire?: string;
  cu_ca_cc_mode?: boolean;
};

@Injectable()
export class AideRepository {
  private static catalogue_aides: Map<string, AideDefinition>;

  constructor(private prisma: PrismaService) {
    AideRepository.catalogue_aides = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadCache();
    } catch (error) {
      console.error(
        `Error loading Aides definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  @Cron('* * * * *')
  public async loadCache() {
    const new_map: Map<string, AideDefinition> = new Map();
    let liste_aides;
    if (App.isProd()) {
      liste_aides = await this.prisma.aide.findMany({
        where: {
          VISIBLE_PROD: true,
        },
      });
    } else {
      liste_aides = await this.prisma.aide.findMany();
    }

    for (const aide of liste_aides) {
      new_map.set(aide.content_id, this.buildAideFromDB(aide));
    }
    AideRepository.catalogue_aides = new_map;
  }

  public async findAidesByPartenaireId(part_id: string) {
    const result = await this.prisma.aide.findMany({
      where: {
        partenaires_supp_ids: {
          has: part_id,
        },
      },
    });
    return result.map((r) => this.buildAideFromDB(r));
  }

  public async updateAideCodesFromPartenaire(
    cms_id: string,
    codes_commune: string[],
    codes_departement_from_partenaire: string[],
    codes_region_from_partenaire: string[],
  ) {
    await this.prisma.aide.update({
      where: { content_id: cms_id },
      data: {
        codes_commune_from_partenaire: codes_commune,
        codes_departement_from_partenaire: codes_departement_from_partenaire,
        codes_region_from_partenaire: codes_region_from_partenaire,
      },
    });
  }

  public static resetCache() {
    // FOR TEST ONLY
    AideRepository.catalogue_aides = new Map();
  }

  public getAide(cms_id: string): AideDefinition {
    return AideRepository.catalogue_aides.get(cms_id);
  }

  async upsert(aide: AideDefinition): Promise<void> {
    const data: AideDB = {
      ...aide,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.aide.upsert({
      where: { content_id: aide.content_id },
      create: {
        ...data,
      },
      update: {
        ...data,
      },
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.aide.delete({
      where: { content_id: content_id },
    });
  }

  async getByContentIdFromDB(content_id: string): Promise<AideDefinition> {
    const result = await this.prisma.aide.findUnique({
      where: { content_id: content_id },
    });
    return this.buildAideFromDB(result);
  }

  async listAll(): Promise<AideDefinition[]> {
    const liste_aides = await this.prisma.aide.findMany();
    return liste_aides.map((a) => this.buildAideFromDB(a));
  }

  async countAll(): Promise<number> {
    const count = await this.prisma.aide.count();
    return Number(count);
  }

  async listePaginated(skip: number, take: number): Promise<AideDefinition[]> {
    const results = await this.prisma.aide.findMany({
      skip: skip,
      take: take,
      orderBy: {
        content_id: 'desc',
      },
    });
    return results.map((r) => this.buildAideFromDB(r));
  }
  async isCodePostalCouvert(code_postal: string): Promise<boolean> {
    if (!code_postal) return false;
    let count;
    if (App.isProd()) {
      count = await this.prisma.aide.count({
        where: { codes_postaux: { has: code_postal }, VISIBLE_PROD: true },
      });
    } else {
      count = await this.prisma.aide.count({
        where: { codes_postaux: { has: code_postal } },
      });
    }
    return count > 0;
  }

  async count(filter: AideFilter): Promise<number> {
    const query = this.buildSearchQuery(filter);
    return await this.prisma.aide.count(query);
  }

  async search(filter: AideFilter): Promise<AideDefinition[]> {
    const query = this.buildSearchQuery(filter);
    const result = await this.prisma.aide.findMany(query);
    return result.map((elem) => this.buildAideFromDB(elem));
  }

  public buildSearchQuery(filter: AideFilter): any {
    const main_filter = [];

    if (App.isProd()) {
      main_filter.push({
        VISIBLE_PROD: true,
      });
    }

    if (filter.code_region) {
      main_filter.push({
        OR: [
          { codes_region: { has: filter.code_region } },
          { codes_region: { isEmpty: true } },
        ],
      });
    }

    if (filter.code_departement) {
      main_filter.push({
        OR: [
          { codes_departement: { has: filter.code_departement } },
          { codes_departement: { isEmpty: true } },
        ],
      });
    }

    if (filter.cu_ca_cc_mode) {
      if (filter.code_postal) {
        main_filter.push({
          OR: [
            { codes_postaux: { has: filter.code_postal } },
            { codes_postaux: { isEmpty: true } },
            {
              echelle: {
                not: {
                  in: ['Communauté de communes'],
                },
              },
            },
          ],
        });
      }
    } else {
      if (filter.code_postal) {
        main_filter.push({
          OR: [
            { codes_postaux: { has: filter.code_postal } },
            { codes_postaux: { isEmpty: true } },
          ],
        });
      }
    }

    if (filter.besoins) {
      main_filter.push({
        besoin: { in: filter.besoins },
      });
    }

    if (filter.echelle) {
      main_filter.push({
        echelle: filter.echelle,
      });
    }

    if (filter.code_commune) {
      main_filter.push({
        OR: [
          { include_codes_commune: { has: filter.code_commune } },
          { include_codes_commune: { isEmpty: true } },
        ],
      });
      main_filter.push({
        OR: [
          { NOT: { exclude_codes_commune: { has: filter.code_commune } } },
          { exclude_codes_commune: { isEmpty: true } },
        ],
      });
    }

    if (filter.commune_pour_partenaire) {
      main_filter.push({
        OR: [
          { codes_commune_from_partenaire: { has: filter.code_commune } },
          { codes_commune_from_partenaire: { isEmpty: true } },
          {
            echelle: {
              in: ['Communauté de communes'],
            },
          },
        ],
      });
    }

    if (filter.departement_pour_partenaire) {
      main_filter.push({
        OR: [
          {
            codes_departement_from_partenaire: {
              has: filter.departement_pour_partenaire,
            },
          },
          { codes_departement_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    if (filter.region_pour_partenaire) {
      main_filter.push({
        OR: [
          {
            codes_region_from_partenaire: {
              has: filter.region_pour_partenaire,
            },
          },
          { codes_region_from_partenaire: { isEmpty: true } },
        ],
      });
    }

    if (filter.thematiques) {
      main_filter.push({
        thematiques: {
          hasSome: filter.thematiques,
        },
      });
    }

    if (filter.date_expiration) {
      main_filter.push({
        OR: [
          { date_expiration: null },
          {
            date_expiration: {
              gt: filter.date_expiration,
            },
          },
        ],
      });
    }

    return {
      take: filter.maxNumber,
      where: {
        AND: main_filter,
      },
    };
  }

  private buildAideFromDB(aideDB: AideDB): AideDefinition {
    if (aideDB === null) return null;
    return {
      content_id: aideDB.content_id,
      titre: aideDB.titre,
      codes_postaux: aideDB.codes_postaux,
      thematiques: aideDB.thematiques.map((th) => Thematique[th]),
      contenu: aideDB.contenu,
      is_simulateur: aideDB.is_simulateur,
      montant_max: aideDB.montant_max,
      url_simulateur: aideDB.url_simulateur,
      besoin: aideDB.besoin,
      besoin_desc: aideDB.besoin_desc,
      codes_departement: aideDB.codes_departement,
      codes_region: aideDB.codes_region,
      exclude_codes_commune: aideDB.exclude_codes_commune,
      include_codes_commune: aideDB.include_codes_commune,
      echelle: Echelle[aideDB.echelle],
      url_source: aideDB.url_source,
      url_demande: aideDB.url_demande,
      date_expiration: aideDB.date_expiration,
      derniere_maj: aideDB.derniere_maj,
      est_gratuit: aideDB.est_gratuit,
      partenaires_supp_ids: aideDB.partenaires_supp_ids,
      codes_commune_from_partenaire: aideDB.codes_commune_from_partenaire,
      codes_departement_from_partenaire:
        aideDB.codes_departement_from_partenaire,
      codes_region_from_partenaire: aideDB.codes_region_from_partenaire,
      VISIBLE_PROD: aideDB.VISIBLE_PROD,
    };
  }
}
