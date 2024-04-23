import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUnArticle(
    articleId: string,
    titre: string,
    rating: number,
    nombreDeRating: number,
    nombreDeMiseEnFavoris: number,
  ) {
    await this.prisma.articleStatistique.upsert({
      where: { articleId },
      create: {
        articleId,
        titre,
        rating,
        nombre_de_rating: nombreDeRating,
        nombre_de_mise_en_favoris: nombreDeMiseEnFavoris,
      },
      update: {
        rating,
        nombre_de_rating: nombreDeRating,
        nombre_de_mise_en_favoris: nombreDeMiseEnFavoris,
      },
    });
  }
}
