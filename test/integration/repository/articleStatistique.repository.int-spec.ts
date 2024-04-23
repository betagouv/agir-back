import { TestUtil } from '../../TestUtil';
import { ArticleStatistiqueRepository } from '../../../src/infrastructure/repository/articleStatistique.repository';

describe('ArticleStatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const articlestatistiqueRepository = new ArticleStatistiqueRepository(
    TestUtil.prisma,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it("upsertStatistiquesDUnArticle  : créer ou modifie les statistiques d'un article", async () => {
    // WHEN
    await articlestatistiqueRepository.upsertStatistiquesDUnArticle(
      'idArticle',
      'Titre article 1',
      3.777,
      3,
      2,
    );
    await articlestatistiqueRepository.upsertStatistiquesDUnArticle(
      'idArticle2',
      'Titre article 2',
      null,
      null,
      0,
    );

    // THEN
    const statistiqueArticleAvecRating =
      await TestUtil.prisma.articleStatistique.findUnique({
        where: { articleId: 'idArticle' },
      });
    const statistiqueArticleSansRating =
      await TestUtil.prisma.articleStatistique.findUnique({
        where: { articleId: 'idArticle2' },
      });

    expect(statistiqueArticleAvecRating.rating.toString()).toEqual('3.8');
    expect(statistiqueArticleSansRating.rating).toBeNull();
    expect(statistiqueArticleAvecRating.titre).toEqual('Titre article 1');
    expect(statistiqueArticleSansRating.titre).toEqual('Titre article 2');
    expect(statistiqueArticleAvecRating.nombre_de_mise_en_favoris).toEqual(2);
    expect(statistiqueArticleSansRating.nombre_de_mise_en_favoris).toEqual(0);
    expect(statistiqueArticleAvecRating.nombre_de_rating).toEqual(3);
    expect(statistiqueArticleSansRating.nombre_de_rating).toBeNull();
  });
});
