import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleStatistiqueRepository } from '../../src/infrastructure/repository/articleStatistique.repository';
import { Scope } from '../domain/utilisateur/utilisateur';

@Injectable()
export class ArticleStatistiqueUsecase {
  constructor(
    private articleRepository: ArticleRepository,
    private utilisateurRepository: UtilisateurRepository,
    private articleStatistiqueRepository: ArticleStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    const statistiqueArticles = await this.calculStatistiqueArticles(
      listeUtilisateursIds,
    );

    for (const [key, value] of Object.entries(statistiqueArticles)) {
      const titreDeLArticle =
        await this.articleRepository.getArticleByContentId(key);

      await this.articleStatistiqueRepository.upsertStatistiquesDUnArticle(
        key,
        titreDeLArticle.titre,
        value.compteurDesNotes
          ? value.totalDesNotes / value.compteurDesNotes
          : null,
        value.compteurDesNotes,
        value.nombreMiseEnFavoris,
      );
    }

    return Object.keys(statistiqueArticles);
  }

  private async calculStatistiqueArticles(
    listeUtilisateursIds: string[],
  ): Promise<
    Map<
      string,
      {
        totalDesNotes: number;
        compteurDesNotes: number;
        nombreMiseEnFavoris: number;
      }
    >
  > {
    const statistiqueArticles: Map<
      string,
      {
        totalDesNotes: number;
        compteurDesNotes: number;
        nombreMiseEnFavoris: number;
      }
    > = new Map();

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user = await this.utilisateurRepository.getById(
        listeUtilisateursIds[index],
        [Scope.history_article_quizz],
      );

      user.history.article_interactions.forEach((article) => {
        if (statistiqueArticles[article.content_id]) {
          if (article.like_level) {
            statistiqueArticles[article.content_id].totalDesNotes +=
              article.like_level;
            statistiqueArticles[article.content_id].compteurDesNotes += 1;
          }
          if (article.favoris) {
            statistiqueArticles[article.content_id].nombreMiseEnFavoris += 1;
          }
        } else {
          statistiqueArticles[article.content_id] = {
            totalDesNotes: article.like_level ? article.like_level : null,
            compteurDesNotes: article.like_level ? 1 : null,
            nombreMiseEnFavoris: article.favoris ? 1 : 0,
          };
        }
      });
    }
    return statistiqueArticles;
  }
}
