import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Suivi as SuiviDB } from '@prisma/client';
import { Suivi } from '../../domain/suivi/suivi';
import { SuiviCollection } from '../../domain/suivi/suiviCollection';
import { SuiviTransport } from '../..//domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../domain/suivi/suiviAlimentation';

@Injectable()
export class SuiviRepository {
  constructor(private prisma: PrismaService) {}

  async createSuivi(
    suivi: Suivi,
    utilisateurId: string,
  ): Promise<string | null> {
    let record = await this.prisma.suivi.create({
      data: {
        id: uuidv4(),
        type: suivi.getType(),
        attributs: suivi.getAttributs(),
        valeurs: suivi.getValeursAsStrings(),
        utilisateurId,
        created_at: suivi.getDate(),
      },
    });
    return record.id;
  }
  async listAllSuivi(
    utilisateurId: string,
    type?: string,
  ): Promise<SuiviCollection | null> {
    let listSuivis = await this.prisma.suivi.findMany({
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
    type?: string,
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
    for (const suivi of listSuivis) {
      switch (suivi.type) {
        case 'alimentation':
          let alimentation = new SuiviAlimentation(suivi.created_at);
          alimentation.populateValues(suivi.attributs, suivi.valeurs);
          result.alimentation.push(alimentation);
          break;
        case 'transport':
          let transport = new SuiviTransport(suivi.created_at);
          transport.populateValues(suivi.attributs, suivi.valeurs);
          result.transports.push(transport);
          break;
        default:
          throw new Error(`Unknown suivi type : ${suivi.type}`);
      }
    }
    return result;
  }
}
