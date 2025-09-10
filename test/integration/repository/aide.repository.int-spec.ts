import { Besoin } from '../../../src/domain/aides/besoin';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { AideRepository } from '../../../src/infrastructure/repository/aide.repository';
import { DB, TestUtil } from '../../TestUtil';

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

  it('countAll()', async () => {
    expect(await aideRepository.listAll()).toHaveLength(0);
    expect(await aideRepository.countAll()).toEqual(0);

    await TestUtil.create(DB.aide, {
      besoin: Besoin.acheter_velo,
      besoin_desc: 'hihi',
      codes_commune_from_partenaire: [],
      codes_departement: [],
      codes_departement_from_partenaire: [],
      codes_postaux: [],
      codes_region: [],
      codes_region_from_partenaire: [],
      content_id: '1',
      contenu: 'haha',
      date_expiration: new Date(),
      derniere_maj: new Date(),
      echelle: Echelle.Commune,
      est_gratuit: false,
      exclude_codes_commune: [],
      include_codes_commune: [],
      is_simulateur: false,
      montant_max: 1000,
      partenaires_supp_ids: ['1'],
      thematiques: [],
      titre: 'titre',
      url_demande: 'c',
      url_simulateur: 'a',
      url_source: 'b',
    });
    await aideRepository.loadCache();

    expect(await aideRepository.listAll()).toHaveLength(1);
    expect(await aideRepository.countAll()).toEqual(1);
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

  it('isCodePostalCouvert : cas du code postal null ou undefined', async () => {
    // GIVEN

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['A', 'B'],
    });

    // WHEN
    let result = await aideRepository.isCodePostalCouvert(undefined);

    // THEN
    expect(result).toEqual(false);

    // WHEN
    let result2 = await aideRepository.isCodePostalCouvert(null);

    // THEN
    expect(result2).toEqual(false);
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
  it('searchsearch : ne liste pas une aide expirée', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      date_expiration: new Date(11),
    });

    // WHEN
    const liste = await aideRepository.search({
      date_expiration: new Date(5678),
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('searchsearch : liste une aide NON expirée', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      date_expiration: new Date(999),
    });

    // WHEN
    const liste = await aideRepository.search({
      date_expiration: new Date(100),
    });

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('searchsearch : liste une aide SANS date d expiration', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      date_expiration: null,
    });

    // WHEN
    const liste = await aideRepository.search({
      date_expiration: new Date(100),
    });

    // THEN
    expect(liste).toHaveLength(1);
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
      codes_region_from_partenaire: ['45', '46'],
      codes_commune_from_partenaire: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '21231',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });

  it('search : le filtre region match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_region_from_partenaire: ['27', '46'],
      codes_commune_from_partenaire: [],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '21231',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });

  it('search : le filtre region et code qui exluent', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['92120'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '21231',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });

  it('search : le filtre departement no match ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_departement_from_partenaire: ['45', '46'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '21231',
    });

    // THEN
    expect(liste).toHaveLength(0);
  });

  it('search : le filtre departement match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_departement_from_partenaire: ['21', '46'],
    });

    // WHEN
    const liste = await aideRepository.search({
      code_commune: '21231',
    });

    // THEN
    expect(liste).toHaveLength(1);
  });

  it.skip('search : le filtre code commune no match ', async () => {
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

  it('search : le filtre commune pour partenaire match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      exclude_codes_commune: [],
      codes_commune_from_partenaire: ['45', '46'],
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

  it('search : filtre liste de besoins ', async () => {
    // GIVEN
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'AAA',
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'BBB',
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      besoin: 'CCC',
    });

    // WHEN
    const liste = await aideRepository.search({
      besoins: ['AAA', 'BBB'],
    });

    // THEN
    liste.sort((a, b) => (a.content_id > b.content_id ? 1 : -1));
    expect(liste).toHaveLength(2);
    expect(liste[0].content_id).toEqual('1');
    expect(liste[1].content_id).toEqual('2');
  });
});
