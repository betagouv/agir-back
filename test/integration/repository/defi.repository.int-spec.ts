import { DB, TestUtil } from '../../TestUtil';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { DefiRepository } from '../../../src/infrastructure/repository/defi.repository';
import { Categorie } from '../../../src/domain/contenu/categorie';

describe('DefiRepository', () => {
  const OLD_ENV = process.env;
  const defiRepository = new DefiRepository(TestUtil.prisma);

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

  it('list : liste defis par categorie', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.defi, {
      content_id: '1',
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.defi, {
      content_id: '2',
      categorie: Categorie.recommandation,
    });

    // WHEN
    const liste = await defiRepository.list({
      categorie: Categorie.recommandation,
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('2');
  });
  it('list : liste defis du mois courant si pas de condition sur mois', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.defi, {
      content_id: '1',
    });

    // WHEN
    const liste = await defiRepository.list({
      date: new Date(),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('list : inclue dfi du mois qui match', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.defi, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await defiRepository.list({
      date: new Date('2024-01-20'),
    });

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].content_id).toEqual('1');
  });
  it('list : inclue pas dfi du mois qui match pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.defi, {
      content_id: '1',
      mois: [1, 2],
    });

    // WHEN
    const liste = await defiRepository.list({
      date: new Date('2024-03-20'),
    });

    // THEN
    expect(liste).toHaveLength(0);
  });
});
