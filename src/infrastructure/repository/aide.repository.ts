import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Aide as AideDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { Aide } from '../../../src/domain/aides/aide';
import { App } from '../../domain/app';
import { Besoin } from '../../../src/domain/aides/besoin';

export type AideFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
};

@Injectable()
export class AideRepository {
  constructor(private prisma: PrismaService) {
    this.last_query_time = 0;
  }

  private last_query_time: number;
  private aides: Aide[];

  private async load_aides() {
    const all_aides = await this.prisma.aide.findMany();
    this.aides = all_aides.map((elem) => this.buildAideFromDB(elem));
  }

  async upsert(aide: Aide): Promise<void> {
    await this.prisma.aide.upsert({
      where: { content_id: aide.content_id },
      create: {
        ...aide,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        ...aide,
        updated_at: undefined,
      },
    });
  }
  async delete(content_id: string): Promise<void> {
    await this.prisma.aide.delete({
      where: { content_id: content_id },
    });
  }

  async getByContentId(content_id: string): Promise<Aide> {
    const result = await this.prisma.aide.findUnique({
      where: { content_id: content_id },
    });
    return this.buildAideFromDB(result);
  }

  async search(filter: AideFilter): Promise<Aide[]> {
    if (App.aide_cache_enabled()) {
      if (Date.now() - this.last_query_time > 100000) {
        await this.load_aides();
        this.last_query_time = Date.now();
      }
      return this.aides.filter(
        (e) =>
          e.codes_postaux.length === 0 ||
          e.codes_postaux.includes(filter.code_postal),
      );
    }
    const main_filter = [];

    if (filter.code_postal) {
      main_filter.push({
        OR: [
          { codes_postaux: { has: filter.code_postal } },
          { codes_postaux: { isEmpty: true } },
        ],
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

    if (filter.thematiques) {
      main_filter.push({
        thematiques: {
          hasSome: filter.thematiques,
        },
      });
    }

    const finalQuery = {
      take: filter.maxNumber,
      where: {
        AND: main_filter,
      },
    };

    const result = await this.prisma.aide.findMany(finalQuery);
    return result.map((elem) => this.buildAideFromDB(elem));
  }

  private buildAideFromDB(aideDB: AideDB): Aide {
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
      besoin: Besoin[aideDB.besoin],
      besoin_desc: aideDB.besoin_desc,
      codes_departement: aideDB.codes_departement,
      codes_region: aideDB.codes_region,
      exclude_codes_commune: aideDB.exclude_codes_commune,
      include_codes_commune: aideDB.include_codes_commune,
    };
  }
}
