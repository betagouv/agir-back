import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { PartenaireDefinition } from '../../domain/contenu/partenaireDefinition';
import { Partenaire } from '@prisma/client';

@Injectable()
export class PartenaireRepository {
  private static catalogue_partenaires: Map<string, PartenaireDefinition>;

  constructor(private prisma: PrismaService) {
    PartenaireRepository.catalogue_partenaires = new Map();
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.loadPartenaires();
    } catch (error) {
      console.error(
        `Error loading partenaires definitions at startup, they will be available in less than a minute by cache refresh mecanism`,
      );
    }
  }

  public static getPartenaire(cms_id: string): PartenaireDefinition {
    return PartenaireRepository.catalogue_partenaires.get(cms_id);
  }

  public static resetCache() {
    // FOR TEST ONLY
    PartenaireRepository.catalogue_partenaires = new Map();
  }

  @Cron('* * * * *')
  public async loadPartenaires() {
    const new_map: Map<string, PartenaireDefinition> = new Map();
    const listePartenaires = await this.prisma.partenaire.findMany();
    for (const partenaire of listePartenaires) {
      new_map.set(partenaire.content_id, {
        id_cms: partenaire.content_id,
        nom: partenaire.nom,
        url: partenaire.url,
        image_url: partenaire.image_url,
      });
    }
    PartenaireRepository.catalogue_partenaires = new_map;
  }

  public async delete(cms_id: string) {
    await this.prisma.partenaire.delete({ where: { content_id: cms_id } });
  }

  public async upsert(partenaire: PartenaireDefinition) {
    const data: Partenaire = {
      content_id: partenaire.id_cms,
      image_url: partenaire.image_url,
      nom: partenaire.nom,
      url: partenaire.url,
      created_at: undefined,
      updated_at: undefined,
    };
    await this.prisma.partenaire.upsert({
      where: {
        content_id: data.content_id,
      },
      create: data,
      update: data,
    });
  }
}