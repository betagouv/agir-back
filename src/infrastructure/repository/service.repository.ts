import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ServiceDefinition as ServiceDefinitionDB,
} from '@prisma/client';
import { ServiceDefinition } from '../../../src/domain/serviceDefinition';
import { v4 as uuidv4 } from 'uuid';

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

  private buildServicefinition(
    serviceDefinition: ServiceDefinitionDB,
  ): ServiceDefinition {
    return {
      id: serviceDefinition.id,
      titre: serviceDefinition.titre,
      url: serviceDefinition.url,
      local: serviceDefinition.local,
    };
  }
}
