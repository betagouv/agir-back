import { TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { AideRepository } from '../../../src/infrastructure/repository/aide.repository';

describe('AideRepository', () => {
  const OLD_ENV = process.env;
  let aideRepository = new AideRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('searchsearch : liste aide par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('search : liste aide sans code postaux', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      codes_postaux: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: 'B',
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('search : liste aide filtre code postal à null', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: null,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('search : liste aide filtre sans code postal ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    const liste = await aideRepository.search({});

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('search : liste avec max number', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', { content_id: '1' });
    await TestUtil.create('aide', { content_id: '2' });
    await TestUtil.create('aide', { content_id: '3' });

    // WHEN
    const liste = await aideRepository.search({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('search : select sans filtre', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
    });
    await TestUtil.create('aide', {
      content_id: '2',
    });
    await TestUtil.create('aide', {
      content_id: '3',
    });

    // WHEN
    const liste = await aideRepository.search({});

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchArticles : filtre par thematiques ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('aide', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('aide', {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await aideRepository.search({
      thematiques: [Thematique.climat],
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('search : filtre par plusieurs thematiques ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('aide', {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create('aide', {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create('aide', {
      content_id: '3',
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const liste = await aideRepository.search({
      thematiques: [Thematique.climat, Thematique.logement],
    });

    // THEN
    expect(liste).toHaveLength(2);
  });
});
