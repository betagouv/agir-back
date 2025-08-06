import { Echelle } from '../../../src/domain/aides/echelle';
import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { PartenaireUsecase } from '../../../src/usecase/partenaire.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('ArticleRepository', () => {
  const OLD_ENV = process.env;
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const partenaireUsecase = new PartenaireUsecase(
    communeRepository,
    partenaireRepository,
  );

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
  it('searchArticles : liste article sans code postaux', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: [],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({});

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
      codes_region_from_partenaire: ['45', '46'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      region_pour_partenaire: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre departement no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement_from_partenaire: ['45', '46'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      departement_pour_partenaire: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre departement match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement_from_partenaire: ['45', '46'],
    });
    await articleRepository.loadCache();

    // WHEN
    const liste = await articleRepository.searchArticles({
      departement_pour_partenaire: '46',
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

  it('search : le filtre commune pour partenaire match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.partenaire, {
      content_id: 'partenaire1',
      nom: 'Bordeaux Métropole',
      echelle: Echelle.Métropole,
      code_epci: '243300316',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      partenaire_id: 'partenaire1',
      titre: 'Article Bordeaux',
    });

    await partenaireRepository.loadCache();
    await articleRepository.loadCache();
    await partenaireUsecase.updateFromPartenaireCodes(
      articleRepository,
      'partenaire1',
    );

    // WHEN
    const bdx = await articleRepository.searchArticles({
      commune_pour_partenaire: '33063',
    });
    const not_bdx = await articleRepository.searchArticles({
      commune_pour_partenaire: '620001',
    });

    // THEN
    expect(bdx).toHaveLength(1);
    expect(not_bdx).toHaveLength(0);
  });

  it('search : le filtre commune pour partenaire match avec region', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.partenaire, {
      content_id: 'partenaire1',
      nom: 'Bordeaux Métropole',
      echelle: Echelle.Métropole,
      code_epci: '243300316',
    });
    await TestUtil.create(DB.partenaire, {
      content_id: 'partenaire2',
      nom: 'Nouvelle Aquitaine',
      echelle: Echelle.Région,
      code_region: '75',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      partenaire_id: 'partenaire1',
      titre: 'Article Bordeaux',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      partenaire_id: 'partenaire2',
      titre: 'Article Nouvelle Aquitaine',
    });

    await partenaireRepository.loadCache();
    await articleRepository.loadCache();
    await partenaireUsecase.updateFromPartenaireCodes(
      articleRepository,
      'partenaire1',
    );

    // WHEN
    const bdx = await articleRepository.searchArticles({
      commune_pour_partenaire: '33063',
    });

    // THEN
    expect(bdx).toHaveLength(2);
  });
});
