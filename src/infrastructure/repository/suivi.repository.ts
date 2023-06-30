import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Suivi as SuiviDB, Prisma } from '@prisma/client';
import { Suivi } from '../../domain/suivi/suivi';
import { SuiviRepas } from '../../../src/domain/suivi/suiviRepas';
import { SuiviCollection } from '../../../src/domain/suivi/suiviCollection';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';

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
    let collection = this.createSuiviCollection([suivi]);
    return collection.mergeAll()[0];
  }

  private createSuiviCollection(listSuivis: SuiviDB[]): SuiviCollection {
    let result = new SuiviCollection();
    for (const suivi of listSuivis) {
      switch (suivi.type) {
        case 'repas':
          let repas = new SuiviRepas(suivi.created_at);
          repas.populateValues(suivi.attributs, suivi.valeurs);
          result.repas.push(repas);
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
