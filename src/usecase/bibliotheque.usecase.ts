import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Thematique } from '../../src/domain/thematique';
import { PersonalArticle } from '../../src/domain/article';
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

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
      est_favoris: favoris,
    });
    console.log(articles_lus);

    let articles = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
    });
    console.log(articles);

    const ordered_personal_articles =
      utilisateur.history.orderArticlesByReadDate(articles);

    console.log(ordered_personal_articles);

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

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    return utilisateur.history.personnaliserArticle(article);
  }
}