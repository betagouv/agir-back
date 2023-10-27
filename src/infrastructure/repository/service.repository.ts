import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ServiceDefinition as ServiceDefinitionDB } from '@prisma/client';
import { ServiceDefinition } from '../../../src/domain/serviceDefinition';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async listeServiceDefinitions(): Promise<ServiceDefinition[]> {
    const result = await this.prisma.serviceDefinition.findMany();
    return result.map((service) => this.buildServicefinition(service));
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
