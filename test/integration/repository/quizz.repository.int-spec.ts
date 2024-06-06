import { DB, TestUtil } from '../../TestUtil';
import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../src/domain/scoring/ponderationApplicative';

describe('QuizzRepository', () => {
  const OLD_ENV = process.env;
  let quizzRepository = new QuizzRepository(TestUtil.prisma);

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
    PonderationApplicativeManager.resetCatalogue();
  });
  it('searchQuizzes : liste quizz du mois courant si pas de condition sur mois', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      date: new Date(),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : inclue article du mois qui match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      date: new Date('2024-01-20'),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('searchQuizzes : inclue pas article du mois qui match pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      date: new Date('2024-03-20'),
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('searchQuizzes : liste quizz par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchQuizzes : select par difficulté', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });

    // WHEN
    const liste = await quizzRepository.searchQuizzes({
      exclude_ids: ['2'],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchQuizzes : exlucde ids #2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });

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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      difficulty: DifficultyLevel.L3,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
});
