import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizStatistiqueRepository {
  constructor(private prisma: PrismaService) {}

  async upsertStatistiquesDUnQuiz(
    quizId: string,
    titre: string,
    nombreDeBonneReponse: number,
    nombreDeMauvaiseReponse: number,
  ) {
    await this.prisma.quizStatistique.upsert({
      where: { quizId },
      create: {
        quizId,
        titre,
        nombre_de_bonne_reponse: nombreDeBonneReponse,
        nombre_de_mauvaise_reponse: nombreDeMauvaiseReponse,
      },
      update: {
        titre,
        nombre_de_bonne_reponse: nombreDeBonneReponse,
        nombre_de_mauvaise_reponse: nombreDeMauvaiseReponse,
      },
    });
  }
}
