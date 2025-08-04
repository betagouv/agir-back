import { Echelle } from 'src/domain/aides/echelle';
import { AideRepository } from 'src/infrastructure/repository/aide.repository';
import { ArticleRepository } from 'src/infrastructure/repository/article.repository';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { PartenaireUsecase } from '../../../src/usecase/partenaire.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('PartenaireUsecase', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const aideRepository = new AideRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const partenaireUsecase = new PartenaireUsecase(
    communeRepository,
    partenaireRepository,
  );

  describe('updateCodesForPartenaire', () => {
    test('ensemble des aides associées à une métropole', async () => {
      const partenaire_id = 'partenaire_1';

      await TestUtil.create(DB.partenaire, {
        content_id: partenaire_id,
        nom: 'Bordeaux Métropole',
        echelle: Echelle.Métropole,
        code_commune: undefined,
        code_epci: '243300316',
        code_departement: undefined,
        code_region: undefined,
      });
      await partenaireRepository.loadCache();

      await TestUtil.create(DB.aide, {
        content_id: '1',
        partenaires_supp_ids: [partenaire_id],
        titre: 'Aide Bordeaux',
      });
      await TestUtil.create(DB.aide, {
        content_id: '2',
        partenaires_supp_ids: [],
        titre: 'Aide 2',
      });
      await aideRepository.loadCache();

      const aide = aideRepository.getAide('1');

      expect(aide.codes_region_from_partenaire).toEqual([]);
      expect(aide.codes_departement_from_partenaire).toEqual([]);
      expect(aide.codes_commune_from_partenaire).toEqual([]);

      await partenaireUsecase.updateCodesForPartenaire(
        partenaire_id,
        aideRepository,
      );
      await aideRepository.loadCache();

      const updatedAide = aideRepository.getAide('1');
      expect(updatedAide.codes_region_from_partenaire).toEqual([]);
      expect(updatedAide.codes_departement_from_partenaire).toEqual([]);
      expect(updatedAide.codes_commune_from_partenaire).toEqual([
        '33063',
        '33281',
        '33318',
        '33522',
        '33550',
        '33449',
        '33039',
        '33119',
        '33192',
        '33249',
        '33162',
        '33069',
        '33075',
        '33167',
        '33003',
        '33056',
        '33200',
        '33519',
        '33312',
        '33013',
        '33096',
        '33032',
        '33273',
        '33376',
        '33065',
        '33004',
        '33434',
        '33487',
      ]);
    });

    test('ensemble des aides associées à une commune', async () => {
      const partenaire_id = 'partenaire_1';

      await TestUtil.create(DB.partenaire, {
        content_id: partenaire_id,
        nom: 'Bordeaux Ville',
        echelle: Echelle.Commune,
        code_commune: '33063',
        code_epci: undefined,
        code_departement: undefined,
        code_region: undefined,
      });
      await partenaireRepository.loadCache();

      await TestUtil.create(DB.aide, {
        content_id: '1',
        partenaires_supp_ids: [partenaire_id],
        titre: 'Aide Bordeaux',
      });
      await TestUtil.create(DB.aide, {
        content_id: '2',
        partenaires_supp_ids: [],
        titre: 'Aide 2',
      });
      await aideRepository.loadCache();

      const aide = aideRepository.getAide('1');

      expect(aide.codes_region_from_partenaire).toEqual([]);
      expect(aide.codes_departement_from_partenaire).toEqual([]);
      expect(aide.codes_commune_from_partenaire).toEqual([]);

      await partenaireUsecase.updateCodesForPartenaire(
        partenaire_id,
        aideRepository,
      );
      await aideRepository.loadCache();

      const updatedAide = aideRepository.getAide('1');
      expect(updatedAide.codes_region_from_partenaire).toEqual([]);
      expect(updatedAide.codes_departement_from_partenaire).toEqual([]);
      expect(updatedAide.codes_commune_from_partenaire).toEqual(['33063']);
    });

    test('ensemble des aides associées à un département', async () => {
      const partenaire_id = 'partenaire_1';

      await TestUtil.create(DB.partenaire, {
        content_id: partenaire_id,
        nom: 'Gironde',
        echelle: Echelle.Département,
        code_commune: undefined,
        code_epci: undefined,
        code_departement: '33',
        code_region: undefined,
      });
      await partenaireRepository.loadCache();

      await TestUtil.create(DB.aide, {
        content_id: '1',
        partenaires_supp_ids: [partenaire_id],
        titre: 'Aide Gironde',
      });
      await TestUtil.create(DB.aide, {
        content_id: '2',
        partenaires_supp_ids: [],
        titre: 'Aide 2',
      });
      await aideRepository.loadCache();

      const aide = aideRepository.getAide('1');

      expect(aide.codes_region_from_partenaire).toEqual([]);
      expect(aide.codes_departement_from_partenaire).toEqual([]);
      expect(aide.codes_commune_from_partenaire).toEqual([]);

      await partenaireUsecase.updateCodesForPartenaire(
        partenaire_id,
        aideRepository,
      );
      await aideRepository.loadCache();

      const updatedAide = aideRepository.getAide('1');
      expect(updatedAide.codes_region_from_partenaire).toEqual([]);
      expect(updatedAide.codes_departement_from_partenaire).toEqual(['33']);
      expect(updatedAide.codes_commune_from_partenaire).toEqual([]);
    });

    test('ensemble des aides associées à une région', async () => {
      const partenaire_id = 'partenaire_1';

      await TestUtil.create(DB.partenaire, {
        content_id: partenaire_id,
        nom: 'Nouvelle-Aquitaine',
        echelle: Echelle.Région,
        code_commune: undefined,
        code_epci: '200053759',
        code_departement: undefined,
        code_region: '75',
      });
      await partenaireRepository.loadCache();

      await TestUtil.create(DB.aide, {
        content_id: '1',
        partenaires_supp_ids: [partenaire_id],
        titre: 'Aide Gironde',
      });
      await TestUtil.create(DB.aide, {
        content_id: '2',
        partenaires_supp_ids: [],
        titre: 'Aide 2',
      });
      await aideRepository.loadCache();

      const aide = aideRepository.getAide('1');

      expect(aide.codes_region_from_partenaire).toEqual([]);
      expect(aide.codes_departement_from_partenaire).toEqual([]);
      expect(aide.codes_commune_from_partenaire).toEqual([]);

      await partenaireUsecase.updateCodesForPartenaire(
        partenaire_id,
        aideRepository,
      );
      await aideRepository.loadCache();

      const updatedAide = aideRepository.getAide('1');
      expect(updatedAide.codes_region_from_partenaire).toEqual(['75']);
      expect(updatedAide.codes_departement_from_partenaire).toEqual([]);
      expect(updatedAide.codes_commune_from_partenaire).toEqual([]);
    });
  });

  test('ensemble des articles associés à un partenaire', async () => {
    const partenaire_id = 'partenaire_1';

    await TestUtil.create(DB.partenaire, {
      content_id: partenaire_id,
      nom: 'Partenaire Test',
      echelle: Echelle.Commune,
      code_commune: '33063',
      code_epci: undefined,
      code_departement: undefined,
      code_region: undefined,
    });
    await partenaireRepository.loadCache();

    await TestUtil.create(DB.article, {
      content_id: 'article_1',
      partenaire_id,
      titre: 'Article Partenaire',
    });
    await TestUtil.create(DB.article, {
      content_id: 'article_2',
      partenaire_id: 'partenaire_2',
      titre: 'Article Sans Partenaire',
    });
    await articleRepository.loadCache();

    const article = articleRepository.getArticle('article_1');
    expect(article.codes_region_from_partenaire).toEqual([]);
    expect(article.codes_departement_from_partenaire).toEqual([]);
    expect(article.codes_commune_from_partenaire).toEqual([]);

    await partenaireUsecase.updateCodesForPartenaire(
      partenaire_id,
      articleRepository,
    );

    await articleRepository.loadCache();
    const updatedArticle = articleRepository.getArticle('article_1');
    expect(updatedArticle.codes_region_from_partenaire).toEqual([]);
    expect(updatedArticle.codes_departement_from_partenaire).toEqual([]);
    expect(updatedArticle.codes_commune_from_partenaire).toEqual(['33063']);
  });
});
