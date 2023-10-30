import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ServiceDefinition as ServiceDefinitionDB,
  Service as ServiceDB,
} from '@prisma/client';
import { ServiceDefinition } from '../../../src/domain/serviceDefinition';
import { v4 as uuidv4 } from 'uuid';
import { Service } from '../../../src/domain/service';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async listeServiceDefinitions(): Promise<ServiceDefinition[]> {
    const result = await this.prisma.serviceDefinition.findMany();
    return result.map((service) =>
      ServiceRepository.buildServicefinition(service),
    );
  }
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
  async removeServiceFromUtilisateur(serviceId: string) {
    await this.prisma.service.delete({
      where: {
        id: serviceId,
      },
    });
  }

  public static buildService(serviceDB: ServiceDB): Service {
    return new Service({
      id: serviceDB.id,
      serviceDefinition: serviceDB['serviceDefinition'],
    });
  }

  private static buildServicefinition(
    serviceDefinition: ServiceDefinitionDB,
  ): ServiceDefinition {
    return new ServiceDefinition({
      id: serviceDefinition.id,
      titre: serviceDefinition.titre,
      url: serviceDefinition.url,
      local: serviceDefinition.local,
      is_url_externe: serviceDefinition.is_url_externe,
    });
  }
}
