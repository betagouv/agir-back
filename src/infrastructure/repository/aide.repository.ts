import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Aide as AideDB } from '@prisma/client';
import { AideDefinition } from '../../domain/aides/aideDefinition';
import { AideFilter } from '../../domain/aides/aideFilter';
import { Echelle } from '../../domain/aides/echelle';
import { App } from '../../domain/app';
import { Thematique } from '../../domain/thematique/thematique';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AideRepository
  implements
    WithCache,
    Paginated<AideDefinition>,
    WithPartenaireCodes<AideDefinition>
{
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

  public async findByPartenaireId(
    partenaire_id: string,
  ): Promise<AideDefinition[]> {
    const result = await this.prisma.aide.findMany({
      where: {
        partenaires_supp_ids: {
          has: partenaire_id,
        },
      },
    });
    return result.map((r) => this.buildAideFromDB(r));
  }

  public async updateCodesFromPartenaireFor(
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

  // FIXME: doublon
  async listAll(): Promise<AideDefinition[]> {
    const liste_aides = await this.prisma.aide.findMany();
    return liste_aides.map((a) => this.buildAideFromDB(a));
  }

  async listeAll(): Promise<AideDefinition[]> {
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
    const clauses = AideFilter.buildSearchQueryClauses(filter);

    if (App.isProd()) {
      clauses.push({
        VISIBLE_PROD: true,
      });
    }

    return {
      take: filter.maxNumber,
      where: {
        AND: clauses,
      },
    };
  }

  private buildAideFromDB(aideDB: AideDB): AideDefinition {
    if (aideDB === null) return null;
    return new AideDefinition({
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
    });
  }
}
