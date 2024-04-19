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
      3.7,
    );
    await articlestatistiqueRepository.upsertStatistiquesDUnArticle(
      'idArticle2',
      null,
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

    expect(statistiqueArticleAvecRating.rating.toString()).toEqual('3.7');
    expect(statistiqueArticleSansRating.rating).toBeNull();
  });
});
