import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Thematique } from '../domain/contenu/thematique';
import { PersonalArticle } from '../domain/article/article';
import { ApplicationError } from '../../src/infrastructure/applicationError';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
  ) {}

  async rechercheBiblio(
    utilisateurId: string,
    filtre_thematiques: Thematique[],
    titre: string,
    favoris: boolean,
  ): Promise<Bibliotheque> {
    let result = new Bibliotheque();

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
    );

    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
      est_favoris: favoris,
    });

    let articles = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
    });

    const ordered_personal_articles =
      utilisateur.history.orderArticlesByReadDateAndFavoris(articles);

    ordered_personal_articles.forEach((personal_article) => {
      result.contenu.push({
        ...personal_article,
        type: ContentType.article,
      });
    });

    for (const thematique of Object.values(Thematique)) {
      result.addSelectedThematique(
        thematique,
        filtre_thematiques.includes(thematique) || !filtre_thematiques.length,
      );
    }

    return result;
  }

  public async geArticle(
    utilisateurId: string,
    content_id: string,
  ): Promise<PersonalArticle> {
    const article = await this.articleRepository.getArticleByContentId(
      content_id,
    );

    if (!article) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
    );

    return utilisateur.history.personnaliserArticle(article);
  }
}
