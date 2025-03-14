import { TypeAction } from '../../../src/domain/actions/typeAction';
import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../src/domain/scoring/ponderationApplicative';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('CompteurActionsRepository', () => {
  const OLD_ENV = process.env;
  let compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
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
    PonderationApplicativeManager.resetCatalogue();
  });
  it('loadCache : charge le cache OK', async () => {
    // GIVEN
    await TestUtil.create(DB.compteurActions);

    // WHEN
    await compteurActionsRepository.loadCache();

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(0);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(0);
  });
  it('incrementVue : + 1 en insertion', async () => {
    // GIVEN

    // WHEN
    await compteurActionsRepository.incrementVue({
      code: 'code',
      type: TypeAction.classique,
    });
    await compteurActionsRepository.loadCache();

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(0);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(1);
  });
  it('incrementVue : + 1 en update', async () => {
    // GIVEN
    await TestUtil.create(DB.compteurActions, { vues: 1, faites: 1 });

    // WHEN
    await compteurActionsRepository.incrementVue({
      code: 'code',
      type: TypeAction.classique,
    });
    await compteurActionsRepository.loadCache();

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(1);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(2);
  });
  it('incrementVue : + 1 en update sans cache reload', async () => {
    // GIVEN
    await TestUtil.create(DB.compteurActions, { vues: 1, faites: 1 });

    // WHEN
    await compteurActionsRepository.incrementVue({
      code: 'code',
      type: TypeAction.classique,
    });

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(1);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(2);
  });

  it('incrementFaite : + 1 en insertion', async () => {
    // GIVEN

    // WHEN
    await compteurActionsRepository.incrementFaite({
      code: 'code',
      type: TypeAction.classique,
    });
    await compteurActionsRepository.loadCache();

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(1);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(0);
  });
  it('incrementFaite : + 1 en update', async () => {
    // GIVEN
    await TestUtil.create(DB.compteurActions, { vues: 1, faites: 1 });

    // WHEN
    await compteurActionsRepository.incrementFaite({
      code: 'code',
      type: TypeAction.classique,
    });
    await compteurActionsRepository.loadCache();

    // THEN
    expect(
      compteurActionsRepository.getNombreFaites({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(2);
    expect(
      compteurActionsRepository.getNombreVues({
        code: 'code',
        type: TypeAction.classique,
      }),
    ).toEqual(1);
  });
});
