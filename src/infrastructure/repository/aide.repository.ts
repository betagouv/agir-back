import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Aide as AideDB } from '@prisma/client';
import { Thematique } from '../../domain/contenu/thematique';
import { Aide } from '../../../src/domain/aides/aide';

export type AideFilter = {
  maxNumber?: number;
  thematiques?: Thematique[];
  code_postal?: string;
};

@Injectable()
export class AideRepository {
  constructor(private prisma: PrismaService) {}

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
    let codes_postaux_filter;

    if (filter.code_postal) {
      codes_postaux_filter = [
        { codes_postaux: { has: filter.code_postal } },
        { codes_postaux: { isEmpty: true } },
      ];
    }

    const main_filter = {};

    if (filter.thematiques) {
      main_filter['thematiques'] = {
        hasSome: filter.thematiques,
      };
    }

    const finalQuery = {
      take: filter.maxNumber,
      where: {
        OR: codes_postaux_filter,
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
    };
  }
}
