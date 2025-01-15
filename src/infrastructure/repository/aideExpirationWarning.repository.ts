import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AideExpirationWarning } from '@prisma/client';
import { AideWarningDefinition } from '../../domain/aides/aideWarningDefinition';

@Injectable()
export class AideExpirationWarningRepository {
  constructor(private prisma: PrismaService) {}

  public async delete(cms_id: string) {
    try {
      await this.prisma.aideExpirationWarning.delete({
        where: { aide_cms_id: cms_id },
      });
    } catch (error) {
      // rien a faire :)
    }
  }

  public async get(cms_id: string): Promise<AideWarningDefinition> {
    const result = await this.prisma.aideExpirationWarning.findUnique({
      where: { aide_cms_id: cms_id },
    });
    if (result) {
      return {
        aide_cms_id: result.aide_cms_id,
        last_month: result.last_month,
        last_month_sent: result.last_month_sent,
        last_week: result.last_week,
        last_week_sent: result.last_week_sent,
        expired: result.expired,
        expired_sent: result.expired_sent,
      };
    }
    return null;
  }
  public async get_all(): Promise<AideWarningDefinition[]> {
    const result = await this.prisma.aideExpirationWarning.findMany();
    return result.map((r) => ({
      aide_cms_id: r.aide_cms_id,
      last_month: r.last_month,
      last_month_sent: r.last_month_sent,
      last_week: r.last_week,
      last_week_sent: r.last_week_sent,
      expired: r.expired,
      expired_sent: r.expired_sent,
    }));
  }

  public async upsert(warning: AideWarningDefinition) {
    const data: AideExpirationWarning = {
      aide_cms_id: warning.aide_cms_id,
      last_month: warning.last_month,
      last_month_sent: warning.last_month_sent,
      last_week: warning.last_week,
      last_week_sent: warning.last_week_sent,
      expired: warning.expired,
      expired_sent: warning.expired_sent,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.aideExpirationWarning.upsert({
      where: {
        aide_cms_id: data.aide_cms_id,
      },
      create: data,
      update: data,
    });
  }
}
