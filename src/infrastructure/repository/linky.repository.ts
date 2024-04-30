import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LinkyData,
  LinkyDataElement,
} from '../../../src/domain/linky/linkyData';

@Injectable()
export class LinkyRepository {
  constructor(private prisma: PrismaService) {}

  async upsertDataForPRM(prm: string, data: LinkyDataElement[]): Promise<void> {
    await this.prisma.linky.upsert({
      where: {
        prm: prm,
      },
      create: {
        prm: prm,
        data: data as any,
      },
      update: {
        data: data as any,
      },
    });
  }

  async upsertLinkyEntry(
    prm: string,
    winter_pk: string,
    utilisateurId: string,
  ): Promise<void> {
    await this.prisma.linky.upsert({
      where: {
        prm: prm,
      },
      create: {
        prm: prm,
        winter_pk: winter_pk,
        data: [],
        utilisateurId: utilisateurId,
      },
      update: {
        winter_pk: winter_pk,
        utilisateurId: utilisateurId,
      },
    });
  }
  async getAllPRMs(): Promise<string[]> {
    const result = await this.prisma.linky.findMany({
      select: {
        prm: true,
      },
    });
    return result.map((entry) => entry['prm']);
  }

  async getByPRM(prm: string): Promise<LinkyData> {
    const result = await this.prisma.linky.findUnique({
      where: {
        prm: prm,
      },
    });
    if (result === null) {
      return null;
    }
    return new LinkyData({
      prm: result.prm,
      serie: result.data as any,
      utilisateurId: result.utilisateurId,
      winter_pk: result.winter_pk,
      created_at: result.created_at,
    });
  }
  async isPRMDataEmptyOrMissing(prm: string): Promise<boolean> {
    if (!prm) return true;

    const prm_count = await this.prisma.linky.count({
      where: {
        prm: prm,
      },
    });
    if (prm_count === 1) {
      const prm_empty = await this.prisma.linky.count({
        where: {
          prm: prm,
          data: {
            equals: [],
          },
        },
      });
      return prm_empty === 1;
    } else {
      return true;
    }
  }

  async delete(prm: string): Promise<void> {
    await this.prisma.linky.deleteMany({
      where: {
        prm: prm,
      },
    });
  }
  async deleteOfUtilisateur(utilisateurId: string): Promise<void> {
    await this.prisma.linky.deleteMany({
      where: {
        utilisateurId: utilisateurId,
      },
    });
  }

  async findWinterPKsOrphanEntries(): Promise<
    { utilisateurId: string; winter_pk: string; prm: string }[]
  > {
    const query = `
    SELECT
      "utilisateurId",
      "winter_pk",
      "prm"
    FROM
      "Linky" l
    WHERE NOT EXISTS (
      SELECT "id"
      FROM
        "Utilisateur"
      WHERE
        "id" = l."utilisateurId"
    )
    AND
      "utilisateurId" IS NOT NULL
    AND
      "winter_pk" IS NOT NULL
    ;
    `;
    const result: { utilisateurId: string; winter_pk: string; prm: string }[] =
      await this.prisma.$queryRawUnsafe(query);
    return result;
  }
}
