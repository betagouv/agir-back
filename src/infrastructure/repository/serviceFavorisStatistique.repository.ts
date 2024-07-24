import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ServiceFavorisStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  static service_favoris_map: Map<string, Map<string, number>> = new Map();

  @Cron('* * * * *')
  async loadCachedData(): Promise<void> {
    const new_service_favoris_map = new Map();

    const all = await this.prisma.servicesFavorisStatistique.findMany();

    for (const favoris of all) {
      if (!new_service_favoris_map.get(favoris.service_id)) {
        new_service_favoris_map.set(favoris.service_id, new Map());
      }

      const service_map = new_service_favoris_map.get(favoris.service_id);

      service_map.set(favoris.favoris_id, favoris.count_favoris);
    }

    ServiceFavorisStatistiqueRepository.service_favoris_map =
      new_service_favoris_map;
  }

  public static getFavorisCount(
    service_id: string,
    favoris_id: string,
  ): number {
    const service =
      ServiceFavorisStatistiqueRepository.service_favoris_map.get(service_id);
    if (!service) {
      return 0;
    }
    const favoris_count = service.get(favoris_id);
    if (!favoris_count) {
      return 0;
    }
    return favoris_count;
  }

  async upsertStatistiques(
    service_id: string,
    favoris_id: string,
    titre: string,
    count: number,
  ) {
    await this.prisma.servicesFavorisStatistique.upsert({
      where: {
        service_id_favoris_id: {
          service_id: service_id,
          favoris_id: favoris_id,
        },
      },
      update: {
        titre_favoris: titre,
        count_favoris: count,
      },
      create: {
        favoris_id: favoris_id,
        service_id: service_id,
        titre_favoris: titre,
        count_favoris: count,
      },
    });
  }
}
