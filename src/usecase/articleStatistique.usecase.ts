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
        });
      });
    }
    return tousLesArticlesConsultesParUtilisateur;
  }

  private calculListeDArticleRegroupeParId(
    articles: { id: string; rating: number }[],
  ): Record<string, { sum: number; count: number }> {
    const articlesCacluclesEtRegroupes = {};

    articles.forEach((article) => {
      if (articlesCacluclesEtRegroupes[article.id]) {
        if (article.rating) {
          articlesCacluclesEtRegroupes[article.id] = {
            sum:
              Number(articlesCacluclesEtRegroupes[article.id].sum) +
              article.rating,
            count: articlesCacluclesEtRegroupes[article.id].count + 1,
          };
        }
      } else {
        articlesCacluclesEtRegroupes[article.id] = {
          sum: article.rating ? article.rating : null,
          count: article.rating ? 1 : null,
        };
      }
    });

    return articlesCacluclesEtRegroupes;
  }
}
