import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Suivi as SuiviDB } from '@prisma/client';
import { Suivi } from '../../domain/suivi/suivi';
import { SuiviCollection } from '../../domain/suivi/suiviCollection';
import { SuiviTransport } from '../..//domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../domain/suivi/suiviAlimentation';
import { SuiviType } from '../../domain/suivi/suiviType';

@Injectable()
export class SuiviRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId)
      await this.prisma.suivi.deleteMany({ where: { utilisateurId } });
  }

  async createSuivi(
    suivi: Suivi,
    utilisateurId: string,
  ): Promise<string | null> {
    let record = await this.prisma.suivi.create({
      data: {
        id: uuidv4(),
        type: suivi.getType(),
        data: suivi.cloneAndClean(),
        utilisateurId,
        created_at: suivi.getDate(),
      },
    });
    return record.id;
  }
  async listAllSuivi(
    utilisateurId: string,
    type?: SuiviType,
    maxNumber?: number,
  ): Promise<SuiviCollection | null> {
    let listSuivis = await this.prisma.suivi.findMany({
      take: maxNumber,
      where: {
        utilisateurId,
        type,
      },
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });
    return this.createSuiviCollection(listSuivis);
  }

  async getLastSuivi(
    utilisateurId: string,
    type?: SuiviType,
  ): Promise<Suivi | null> {
    let suivi = await this.prisma.suivi.findFirst({
      where: {
        utilisateurId,
        type,
      },
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });
    return suivi ? this.createSuiviCollection([suivi]).mergeAll()[0] : null;
  }

  private createSuiviCollection(listSuivis: SuiviDB[]): SuiviCollection {
    let result = new SuiviCollection();
    for (const suiviDB of listSuivis) {
      switch (suiviDB.type) {
        case SuiviType.alimentation.toString():
          let alimentation = new SuiviAlimentation(
            suiviDB.created_at,
            suiviDB.data,
          );
          result.alimentation.push(alimentation);
          break;
        case SuiviType.transport.toString():
          let transport = new SuiviTransport(suiviDB.created_at, suiviDB.data);
          result.transports.push(transport);
          break;
        default:
          throw new Error(`Unknown suivi type : ${suiviDB.type}`);
      }
    }
    return result;
  }
}
