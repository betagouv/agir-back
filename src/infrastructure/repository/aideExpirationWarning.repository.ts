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
      };
    }
    return null;
  }

  public async upsert(warning: AideWarningDefinition) {
    const data: AideExpirationWarning = {
      aide_cms_id: warning.aide_cms_id,
      last_month: warning.last_month,
      last_month_sent: warning.last_month_sent,
      last_week: warning.last_week,
      last_week_sent: warning.last_week_sent,
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
