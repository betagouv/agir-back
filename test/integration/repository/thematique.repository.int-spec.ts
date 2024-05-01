import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Univers } from '../../../src/domain/univers/univers';

describe('ThematiqueRepository', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('loadThematiques : charge 2 thematiques OK', async () => {
    // GIVEN
    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await TestUtil.create(DB.thematique, {
      id: '2',
      id_cms: 2,
      titre: 't2',
    });

    // WHEN
    await thematiqueRepository.loadThematiques();

    // THEN
    expect(
      ThematiqueRepository.getLibelleThematique(Thematique.alimentation),
    ).toEqual('t1');
    expect(
      ThematiqueRepository.getLibelleThematique(Thematique.climat),
    ).toEqual('t2');
  });
  it('loadUnivers : charge 2 univers OK', async () => {
    // GIVEN
    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'haha',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'hoho',
    });

    // WHEN
    await thematiqueRepository.loadUnivers();

    // THEN
    expect(ThematiqueRepository.getTuileUnivers(Univers.climat).titre).toEqual(
      'haha',
    );
    expect(
      ThematiqueRepository.getTuileUnivers(Univers.alimentation).titre,
    ).toEqual('hoho');
  });
  it('upsertThematique : met a jour correctement une thematique', async () => {
    // GIVEN
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await TestUtil.create(DB.thematique, {
      id: '2',
      id_cms: 2,
      titre: 't2',
    });

    // WHEN
    await thematiqueRepository.upsertThematique(1, 'new titre');
    await thematiqueRepository.loadThematiques();

    // THEN
    const dbTh1 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 1 },
    });
    const dbTh2 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 2 },
    });
    expect(dbTh1.titre).toEqual('new titre');
    expect(dbTh2.titre).toEqual('t2');
    expect(
      ThematiqueRepository.getLibelleThematique(Thematique.alimentation),
    ).toEqual('new titre');
  });
  it('upsertThematique : crée une thematique', async () => {
    // GIVEN
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });

    // WHEN
    await thematiqueRepository.upsertThematique(2, 'new them');
    await thematiqueRepository.loadThematiques();

    // THEN
    const dbTh1 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 1 },
    });
    const dbTh2 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 2 },
    });
    expect(dbTh1.titre).toEqual('t1');
    expect(dbTh2.titre).toEqual('new them');
    expect(
      ThematiqueRepository.getLibelleThematique(Thematique.climat),
    ).toEqual('new them');
  });
  it('upsertThematique : thematique non connue, silencieux', async () => {
    // GIVEN
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });

    // WHEN
    await thematiqueRepository.upsertThematique(10, 'new them');
    await thematiqueRepository.loadThematiques();

    // THEN
    const dbTh1 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 1 },
    });
    const dbTh2 = await TestUtil.prisma.thematique.findUnique({
      where: { id_cms: 10 },
    });
    expect(dbTh1.titre).toEqual('t1');
    expect(dbTh2.titre).toEqual('new them');
  });
});
