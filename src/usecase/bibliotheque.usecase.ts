import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../../src/domain/contenu/contenuBibliotheque';
import { ContentType } from '../../src/domain/contenu/contentType';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../src/domain/thematique';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
  ) {}

  async listContenuDejaConsulte(utilisateurId: string): Promise<Bibliotheque> {
    let result = new Bibliotheque();

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    const articles_lus = utilisateur.history.listeIdsArticlesLus();

    let articles = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
    });

    articles.forEach((article) => {
      result.contenu.push({
        ...article,
        type: ContentType.article,
        thematique_principale: article.thematique_gamification,
      });
    });

    for (const thematique of Object.values(Thematique)) {
      result.addSelectedThematique(thematique, true);
    }

    return result;
  }
}
