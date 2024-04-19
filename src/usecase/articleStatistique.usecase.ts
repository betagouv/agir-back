import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleStatistiqueRepository } from '../../src/infrastructure/repository/articleStatistique.repository';

@Injectable()
export class ArticleStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleStatistiqueRepository: ArticleStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    const tousLesArticlesConsultesParUtilisateur =
      await this.recupereTousLesArticlesConsultesParUtilisateur(
        listeUtilisateursIds,
      );

    const listeDArticlesCalculesEtRegroupesParId =
      this.calculListeDArticleRegroupeParId(
        tousLesArticlesConsultesParUtilisateur,
      );

    for (const [key, value] of Object.entries(
      listeDArticlesCalculesEtRegroupesParId,
    )) {
      await this.articleStatistiqueRepository.upsertStatistiquesDUnArticle(
        key,
        value.count ? value.sum / value.count : null,
        value.nombreMiseEnFavoris,
      );
    }

    return Object.keys(listeDArticlesCalculesEtRegroupesParId);
  }

  private async recupereTousLesArticlesConsultesParUtilisateur(
    listeUtilisateursIds: string[],
  ): Promise<
    {
      id: string;
      rating: number;
      favoris: boolean;
    }[]
  > {
    const tousLesArticlesConsultesParUtilisateur = [];
    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user = await this.utilisateurRepository.getById(
        listeUtilisateursIds[index],
      );

      user.history.article_interactions.forEach((article) => {
        tousLesArticlesConsultesParUtilisateur.push({
          id: article.content_id,
          rating: article.like_level,
          favoris: article.favoris,
        });
      });
    }
    return tousLesArticlesConsultesParUtilisateur;
  }

  private calculListeDArticleRegroupeParId(
    articles: { id: string; rating: number; favoris: boolean }[],
  ): Record<
    string,
    { sum: number; count: number; nombreMiseEnFavoris: number }
  > {
    const articlesCacluclesEtRegroupes = {};

    articles.forEach((article) => {
      if (articlesCacluclesEtRegroupes[article.id]) {
        if (article.rating) {
          articlesCacluclesEtRegroupes[article.id] = {
            sum:
              Number(articlesCacluclesEtRegroupes[article.id].sum) +
              article.rating,
            count: articlesCacluclesEtRegroupes[article.id].count + 1,
            nombreMiseEnFavoris:
              articlesCacluclesEtRegroupes[article.id].nombreMiseEnFavoris,
          };
        }
        if (article.favoris) {
          articlesCacluclesEtRegroupes[article.id] = {
            sum: articlesCacluclesEtRegroupes[article.id].sum,
            count: articlesCacluclesEtRegroupes[article.id].count,
            nombreMiseEnFavoris:
              articlesCacluclesEtRegroupes[article.id].nombreMiseEnFavoris + 1,
          };
        }
      } else {
        articlesCacluclesEtRegroupes[article.id] = {
          sum: article.rating ? article.rating : null,
          count: article.rating ? 1 : null,
          nombreMiseEnFavoris: article.favoris ? 1 : 0,
        };
      }
    });

    return articlesCacluclesEtRegroupes;
  }
}
