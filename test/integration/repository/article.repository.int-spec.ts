import { TestUtil } from '../../TestUtil';
import { InteractionRepository } from '../../../src/infrastructure/repository/interaction.repository';
import { Interaction } from '../../../src/domain/interaction/interaction';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { Thematique } from '../../../src/domain/thematique';
import { UserQuizzProfile } from '../../../src/domain/quizz/userQuizzProfile';
import { Decimal } from '@prisma/client/runtime/library';
import { InteractionScore } from '../../../src/domain/interaction/interactionScore';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';

describe('ArticleRepository', () => {
  let articleRepository = new ArticleRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('searchArticles : liste article par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', { content_id: '1' });
    await TestUtil.create('article', { content_id: '2' });
    await TestUtil.create('article', { content_id: '3' });

    // WHEN
    const liste = await articleRepository.searchArticles({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchArticles : select par difficulté', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('article', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('article', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('article', {
      content_id: '2',
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', { content_id: '1' });
    await TestUtil.create('article', { content_id: '2' });
    await TestUtil.create('article', { content_id: '3' });

    // WHEN
    const liste = await articleRepository.searchArticles({
      exclude_ids: ['2'],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('searchArticles : exlucde ids #2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', { content_id: '1' });
    await TestUtil.create('article', { content_id: '2' });
    await TestUtil.create('article', { content_id: '3' });

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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('article', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('article', {
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
    await TestUtil.create('utilisateur');
    await TestUtil.create('article', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('article', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('article', {
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
});
