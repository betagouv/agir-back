import { TestUtil } from '../../TestUtil';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { Thematique } from '../../../src/domain/thematique';

describe('QuizzRepository', () => {
  let quizzRepository = new QuizzRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });
  it('searchQuizzes : liste quizz par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : liste quizz sans code postaux', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      codes_postaux: [],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : liste quizz filtre code postal à null', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      code_postal: null,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : liste quizz filtre sans code postal ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({});

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : liste avec max number', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', { content_id: '1' });
    await TestUtil.create('quizz', { content_id: '2' });
    await TestUtil.create('quizz', { content_id: '3' });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchQuizzes : select par difficulté', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      difficulty: DifficultyLevel.L2,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('2');
  });
  it('searchQuizzes : select par difficulté ANY', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      difficulty: DifficultyLevel.ANY,
    });

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchQuizzes : select sans filtre', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L3,
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({});

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchQuizzes : exlucde ids', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', { content_id: '1' });
    await TestUtil.create('quizz', { content_id: '2' });
    await TestUtil.create('quizz', { content_id: '3' });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      exclude_ids: ['2'],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchQuizzes : exlucde ids #2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', { content_id: '1' });
    await TestUtil.create('quizz', { content_id: '2' });
    await TestUtil.create('quizz', { content_id: '3' });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      exclude_ids: ['1', '2'],
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('3');
  });
  it('searchQuizzes : filtre par thematiques ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      thematiques: [Thematique.climat],
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : filtre par plusieurs thematiques ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      thematiques: [Thematique.climat, Thematique.logement],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchQuizzes : order by difficulté ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L3,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L1,
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      asc_difficulty: true,
    });

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste[0].content_id).toEqual('3');
    expect(liste[1].content_id).toEqual('2');
    expect(liste[2].content_id).toEqual('1');
  });
  it('getQuizzRecommendations : order by rubrique/diffculty ponderation', async () => {
    // GIVEN
    await TestUtil.create('ponderation', {
      version: 0,
      rubriques: {
        '1': 10,
        '2': 20,
        '3': 30,
      },
    });
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['1'],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['3'],
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['2'],
    });
    await TestUtil.create('quizz', {
      content_id: '4',
      difficulty: DifficultyLevel.L2,
      rubrique_ids: ['1'],
    });
    await TestUtil.create('quizz', {
      content_id: '5',
      difficulty: DifficultyLevel.L2,
      rubrique_ids: ['3'],
    });

    // WHEN
    const reco = await quizzRepository.getQuizzRecommandations(0);

    // THEN
    expect(reco.liste).toHaveLength(5);
    expect(reco.liste[0].content_id).toEqual('2');
    expect(reco.liste[1].content_id).toEqual('3');
    expect(reco.liste[2].content_id).toEqual('1');
    expect(reco.liste[3].content_id).toEqual('5');
    expect(reco.liste[4].content_id).toEqual('4');
  });
  it('getQuizzRecommendations : ne plante pas si version manquante', async () => {
    // GIVEN
    await TestUtil.create('ponderation', {
      version: 2,
      rubriques: {
        '1': 10,
        '2': 20,
        '3': 30,
      },
    });
    await TestUtil.create('article', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['2'],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['1'],
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['3'],
    });

    // WHEN
    const reco = await quizzRepository.getQuizzRecommandations(0);

    // THEN
    expect(reco.liste).toHaveLength(0);
  });
  it('getQuizzRecommendations : ne plante pas si table ponderation vide', async () => {
    // GIVEN
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['2'],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['1'],
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      difficulty: DifficultyLevel.L1,
      rubrique_ids: ['3'],
    });

    // WHEN
    const reco = await quizzRepository.getQuizzRecommandations(0);

    // THEN
    expect(reco.liste).toHaveLength(0);
  });
});
