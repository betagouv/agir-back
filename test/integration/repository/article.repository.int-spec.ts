import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('ArticleRepository', () => {
  const OLD_ENV = process.env;
  const articleRepository = new ArticleRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('searchArticles : liste articles par tag article', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: '123',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: '456',
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      tag_article: '123',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchArticles : liste articles du mois courant si pas de condition sur mois', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();
    // WHEN
    const liste = await articleRepository.searchArticles({ take: 2 });

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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
    await articleRepository.loadCache();

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

  it('search : le filtre region no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: '21000',
      code_region: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre region match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: '21000',
      code_region: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre region et code qui exluent', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: ['91120'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_postal: '21000',
      code_region: '46',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre departement no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement: ['45', '46'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_departement: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre departement match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement: ['45', '46'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_departement: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      include_codes_commune: ['45', '46'],
      exclude_codes_commune: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_commune: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre code commune match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      include_codes_commune: ['45', '46'],
      exclude_codes_commune: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_commune: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune exlusion no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      exclude_codes_commune: ['45', '46'],
      include_codes_commune: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_commune: '47',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune exclusion match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      exclude_codes_commune: ['45', '46'],
      include_codes_commune: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      code_commune: '46',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
});
