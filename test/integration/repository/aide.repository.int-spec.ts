import { DB, TestUtil } from '../../TestUtil';
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
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('isCodePostalCouvert : indique si un code postal est couvert par au moins une aide', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    let result = await aideRepository.isCodePostalCouvert('A');
    // THEN
    expect(result).toEqual(true);

    // WHEN
    result = await aideRepository.isCodePostalCouvert('B');
    // THEN
    expect(result).toEqual(true);

    // WHEN
    result = await aideRepository.isCodePostalCouvert('C');
    // THEN
    expect(result).toEqual(false);
  });

  it('searchsearch : liste aide par code postal parmi plusieurs', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, { content_id: '1' });
    await TestUtil.create(DB.aide, { content_id: '2' });
    await TestUtil.create(DB.aide, { content_id: '3' });

    // WHEN
    const liste = await aideRepository.search({ maxNumber: 2 });

    // THEN
    expect(liste).toHaveLength(2);
  });
  it('search : select sans filtre', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
    });

    // WHEN
    const liste = await aideRepository.search({});

    // THEN
    expect(liste).toHaveLength(3);
  });
  it('searchArticles : filtre par thematiques ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
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
  it('search : le filtre region no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: '21000',
      code_region: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre region match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: '21000',
      code_region: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre region et code qui exluent', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_region: ['45', '46'],
      codes_postaux: ['91120'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_postal: '21000',
      code_region: '46',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre departement no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_departement: ['45', '46'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_departement: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre departement match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_departement: ['45', '46'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_departement: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      include_codes_commune: ['45', '46'],
      exclude_codes_commune: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '47',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('search : le filtre code commune match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      include_codes_commune: ['45', '46'],
      exclude_codes_commune: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '46',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune exlusion no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      exclude_codes_commune: ['45', '46'],
      include_codes_commune: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '47',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('search : le filtre code commune exclusion match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      exclude_codes_commune: ['45', '46'],
      include_codes_commune: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '46',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
});
