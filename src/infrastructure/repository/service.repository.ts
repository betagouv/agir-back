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

  async listeServiceDefinitions(): Promise<ServiceDefinition[]> {
    const result = await this.prisma.serviceDefinition.findMany();
    return result.map((service) => this.buildServicefinition(service));
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

  private buildService(serviceDB: ServiceDB): Service {
    return new Service({
      ...serviceDB['serviceDefinition'],
      id: serviceDB.id,
    });
  }

  private buildServicefinition(
    serviceDefinitionDB: ServiceDefinitionDB,
  ): ServiceDefinition {
    return new ServiceDefinition({
      ...serviceDefinitionDB,
      thematiques: serviceDefinitionDB.thematiques.map((th) => Thematique[th]),
    });
  }
}
