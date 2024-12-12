import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { Thematique } from '../domain/contenu/thematique';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { Article } from '../domain/contenu/article';
import { EventUsecase } from './event.usecase';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Quizz } from '../domain/contenu/quizz';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private personnalisator: Personnalisator,
    private eventUsecase: EventUsecase,
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
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
      est_favoris: favoris,
    });

    let article_definitions = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
    });

    const ordered_articles =
      utilisateur.history.orderArticlesByReadDateAndFavoris(
        article_definitions,
      );

    result.addArticles(ordered_articles);

    for (const thematique of ThematiqueRepository.getAllThematiques()) {
      if (thematique !== Thematique.services_societaux)
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
  ): Promise<Article> {
    const article_definition =
      await this.articleRepository.getArticleDefinitionByContentId(content_id);

    if (!article_definition) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.history_article_quizz_aides,
        Scope.gamification,
        Scope.missions,
        Scope.kyc,
        Scope.todo,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const result =
      utilisateur.history.getArticleFromBibliotheque(article_definition);

    await this.eventUsecase.readArticle(content_id, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  public async getQuizz(
    utilisateurId: string,
    content_id: string,
  ): Promise<Quizz> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const quizz = await this.quizzRepository.getQuizzByContentId(content_id);

    if (!quizz) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    if (quizz.article_id) {
      quizz.article_contenu = (
        await this.articleRepository.getArticleDefinitionByContentId(
          quizz.article_id,
        )
      ).contenu;
    }

    return this.personnalisator.personnaliser(quizz, utilisateur, [
      CLE_PERSO.espace_insecable,
    ]);
  }
}
