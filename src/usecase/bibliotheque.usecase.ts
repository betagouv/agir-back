import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Thematique } from '../../src/domain/thematique';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
  ) {}

  async listContenuDejaConsulte(
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

    let articles = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
    });

    articles = utilisateur.history.orderArticlesByReadDate(articles);

    articles.forEach((article) => {
      result.contenu.push({
        ...article,
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
}
