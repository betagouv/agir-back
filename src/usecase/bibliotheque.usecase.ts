import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { Article } from '../domain/contenu/article';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { IncludeArticle } from '../domain/contenu/includeArticle';
import { Quizz } from '../domain/contenu/quizz';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
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

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.no_blank_links,
      CLE_PERSO.block_text_cms,
    ]);
  }

  // tous les articles par défaut
  async rechercheBiblio_v2(
    utilisateurId: string,
    filtre_thematiques: Thematique[],
    titre: string,
    includes: IncludeArticle[] = [IncludeArticle.tout],
    skip: number = 0,
    take: number = 1000000,
  ): Promise<Bibliotheque> {
    let result = new Bibliotheque();

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let articles_candidats_ids: string[];
    if (!(includes.includes(IncludeArticle.tout) || includes.length === 0)) {
      articles_candidats_ids = utilisateur.history.searchArticlesIds({
        est_lu: includes.includes(IncludeArticle.lu),
        est_favoris: includes.includes(IncludeArticle.favoris),
      });
    }
    const dept_region = CommuneRepository.findDepartementRegionByCodeCommune(
      utilisateur.logement.code_commune,
    );

    // TODO: to factorize with aide.usecase.ts to have a common filter
    // builder for articles and aides
    const articles = await this.articleRepository.searchArticles({
      include_ids: articles_candidats_ids,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
      code_commune: utilisateur.logement.code_commune,
      code_departement: dept_region?.code_departement,
      code_region: dept_region?.code_region,
      commune_pour_partenaire: utilisateur.logement.code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
    });

    const ordered_articles =
      utilisateur.history.orderArticlesByReadDateAndFavoris(articles);

    result.addArticles(ordered_articles.slice(skip, skip + take));
    result.setNombreResultatsDispo(ordered_articles.length);

    for (const thematique of ThematiqueRepository.getAllThematiques()) {
      if (thematique !== Thematique.services_societaux)
        result.addSelectedThematique(
          thematique,
          filtre_thematiques.includes(thematique),
        );
    }

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.no_blank_links,
      CLE_PERSO.block_text_cms,
    ]);
  }

  public async getArticleAnonymous(content_id: string): Promise<Article> {
    const article_definition = await this.articleRepository.getArticle(
      content_id,
    );

    if (!article_definition) {
      ApplicationError.throwArticleNotFound(content_id);
    }
    return this.personnalisator.personnaliser(new Article(article_definition));
  }

  public async getQuizzAnonymous(content_id: string): Promise<Quizz> {
    const quizz_def = await this.quizzRepository.getQuizz(content_id);

    if (!quizz_def) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const quizz = new Quizz(quizz_def);

    if (quizz_def.article_id) {
      quizz.article = await this.articleRepository.getArticle(
        quizz_def.article_id,
      );
    }

    return quizz;
  }

  public async getArticle(
    utilisateurId: string,
    content_id: string,
  ): Promise<Article> {
    const article_definition = await this.articleRepository.getArticle(
      content_id,
    );

    if (!article_definition) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.history_article_quizz_aides,
        Scope.gamification,
        Scope.kyc,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const result =
      utilisateur.history.getArticleFromBibliotheque(article_definition);

    utilisateur.history.lireArticle(content_id);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async shareArticle(utilisateurId: string, content_id: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const article_def = this.articleRepository.getArticle(content_id);

    if (!article_def) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    utilisateur.history.shareArticle(content_id);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
  }

  public async addQuizzAttempt(
    utilisateurId: string,
    content_id: string,
    pourcent: number,
  ) {
    if (pourcent === null || pourcent === undefined) {
      ApplicationError.throwMissingPourcent();
    }
    const rounded_pourcent = Math.round(pourcent);
    if (isNaN(rounded_pourcent)) {
      ApplicationError.throwBadQuizzPourcent(pourcent);
    }
    if (rounded_pourcent < 0 || rounded_pourcent > 100) {
      ApplicationError.throwBadQuizzPourcent(pourcent);
    }

    const quizz_definition = await this.quizzRepository.getQuizz(content_id);

    if (!quizz_definition) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.gamification, Scope.kyc],
    );

    Utilisateur.checkState(utilisateur);

    utilisateur.history.quizzAttempt(content_id, pourcent);

    utilisateur.history.lireArticle(quizz_definition.article_id);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
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

    return await this.external_get_quizz(content_id);
  }

  public async external_get_quizz(content_id: string): Promise<Quizz> {
    const quizz_def = await this.quizzRepository.getQuizz(content_id);

    if (!quizz_def) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const quizz = new Quizz(quizz_def);
    if (quizz_def.article_id) {
      quizz.article = await this.articleRepository.getArticle(
        quizz_def.article_id,
      );
    }

    return this.personnalisator.personnaliser(quizz, undefined, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  public async external_read_article(
    content_id: string,
    utilisateur: Utilisateur,
  ) {
    if (!content_id) return;

    utilisateur.history.lireArticle(content_id);
  }
}
