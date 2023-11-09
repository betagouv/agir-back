import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ServiceDefinition as ServiceDefinitionDB,
  Service as ServiceDB,
} from '@prisma/client';
import { ServiceDefinition } from '../../domain/service/serviceDefinition';
import { v4 as uuidv4 } from 'uuid';
import { Service } from '../../domain/service/service';
import { Thematique } from '../../../src/domain/thematique';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async addServiceToUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    try {
      await this.prisma.service.create({
        data: {
          id: uuidv4(),
          serviceDefinitionId: serviceDefinitionId,
          utilisateurId: utilisateurId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error(
            `Le service d'id ${serviceDefinitionId} n'existe pas`,
          );
        }
        if (error.code === 'P2002') {
          throw new Error(
            `Le service d'id ${serviceDefinitionId} est dejà associé à cet utilisateur`,
          );
        }
        throw error;
      }
    }
  }
  async removeServiceFromUtilisateurByServiceDefinitionId(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    await this.prisma.service.deleteMany({
      where: {
        utilisateurId: utilisateurId,
        serviceDefinitionId: serviceDefinitionId,
      },
    });
  }
  async listeServicesOfUtilisateur(utilisateurId: string): Promise<Service[]> {
    const result = await this.prisma.service.findMany({
      where: {
        utilisateurId: utilisateurId,
      },
      include: {
        serviceDefinition: true,
      },
    });
    return result.map((service) => this.buildService(service));
  }
  async listeServiceDefinitionsAndUserRelatedServices(
    utilisateurId?: string,
  ): Promise<ServiceDefinition[]> {
    const result = await this.prisma.serviceDefinition.findMany({
      include: {
        services: {
          where: {
            utilisateurId: utilisateurId || 'XXX',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    return this.buildServiceDefinitionList(result, utilisateurId != undefined);
  }

  async countServiceDefinitionUsage(): Promise<Record<string, number>> {
    const query = `
    SELECT
      COUNT(*) AS "count", "serviceDefinitionId"
    FROM
      "Service"
    GROUP BY "serviceDefinitionId";
    `;
    const count: [{ count: BigInt; serviceDefinitionId: string }] =
      await this.prisma.$queryRawUnsafe(query);
    let result = {};
    count.forEach((element) => {
      result[element.serviceDefinitionId] = Number(element.count);
    });
    return result;
  }

  private buildService(serviceDB: ServiceDB): Service {
    return new Service({
      ...serviceDB['serviceDefinition'],
      serviceId: serviceDB.id,
      serviceDefinitionId: serviceDB['serviceDefinition'].id,
    });
  }

  private async buildServiceDefinitionList(
    serviceDefinitionDB: ServiceDefinitionDB[],
    includeInstalledFlag: boolean,
  ): Promise<ServiceDefinition[]> {
    // FIXME : plus tard en cache ou autre, pas besoin de recalculer à chaque affiche du catalogue de service
    const repartition = await this.countServiceDefinitionUsage();
    return serviceDefinitionDB.map((serviceDefDB) => {
      let occurence = repartition[serviceDefDB.id] || 0;
      return this.buildServicefinition(
        serviceDefDB,
        occurence,
        includeInstalledFlag,
      );
    });
  }

  private buildServicefinition(
    serviceDefinitionDB: ServiceDefinitionDB,
    occurence: number,
    includeInstalledFlag: boolean,
  ): ServiceDefinition {
    return new ServiceDefinition({
      ...serviceDefinitionDB,
      serviceDefinitionId: serviceDefinitionDB.id,
      thematiques: serviceDefinitionDB.thematiques.map((th) => Thematique[th]),
      nombre_installation: occurence,
      is_installed: includeInstalledFlag
        ? serviceDefinitionDB['services'].length > 0
        : undefined,
    });
  }
}
