import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Thematique } from '../domain/contenu/thematique';
import { PersonalArticle } from '../domain/contenu/article';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private personnalisator: Personnalisator,
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
      [Scope.history_article_quizz, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

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
        filtre_thematiques.includes(thematique),
      );
    }

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  public async getArticle(
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
      [Scope.history_article_quizz, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = utilisateur.history.personnaliserArticle(article);

    return this.personnalisator.personnaliser(result, utilisateur);
  }
}
