import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';

describe('ArticleRepository', () => {
  const OLD_ENV = process.env;
  const articleRepository = new ArticleRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('searchArticles : liste articles du mois courant si pas de condition sur mois', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      date: new Date(),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : inclue article du mois qui match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      date: new Date('2024-01-20'),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : inclue pas article du mois qui match pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      date: new Date('2024-03-20'),
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('searchArticles : liste article par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : liste article sans code postaux', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: [],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : liste article filtre code postal à null', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: null,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : liste article filtre sans code postal ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({});

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : liste avec max number', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });

    // WHEN
    const liste = await articleRepository.searchArticles({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchArticles : select par difficulté', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.article, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      difficulty: DifficultyLevel.L2,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('2');
  });
  it('searchArticles : select par difficulté ANY', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      difficulty: DifficultyLevel.ANY,
    });

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchArticles : select sans filtre', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.article, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await articleRepository.searchArticles({});

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchArticles : exlucde ids', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });

    // WHEN
    const liste = await articleRepository.searchArticles({
      exclude_ids: ['2'],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchArticles : exlucde ids #2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });

    // WHEN
    const liste = await articleRepository.searchArticles({
      exclude_ids: ['1', '2'],
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('3');
  });
  it('searchArticles : filtre par thematiques ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      thematiques: [Thematique.climat],
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : filtre par plusieurs thematiques ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.article, {
      content_id: '',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      thematiques: [Thematique.climat, Thematique.logement],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchArticles : order by difficulté ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      difficulty: DifficultyLevel.L3,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      difficulty: DifficultyLevel.L1,
    });

    // WHEN
    const liste = await articleRepository.searchArticles({
      asc_difficulty: true,
    });

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste[0].content_id).toEqual('3');
    expect(liste[1].content_id).toEqual('2');
    expect(liste[2].content_id).toEqual('1');
  });
});
