import { TestUtil } from '../../TestUtil';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';

describe('SuiviRepository', () => {
  let suiviRepository = new SuiviRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Creates a new suivi', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });
    let suiviAlimentation = new SuiviAlimentation();
    suiviAlimentation.viande_rouge = 2;
    await suiviRepository.createSuivi(suiviAlimentation, '1');

    const suivis = await TestUtil.prisma.suivi.findMany({});
    expect(suivis).toHaveLength(1);
    expect(suivis[0].id).toHaveLength(36);
    expect(suivis[0].attributs[0]).toEqual('viande_rouge');
  });

  it('erreur de type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'bad_type',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '1',
        created_at: new Date(123),
      },
    });

    try {
      await suiviRepository.listAllSuivi('1');
    } catch (error) {
      expect(error.message).toEqual('Unknown suivi type : bad_type');
      return;
    }
    fail();
  });

  it('liste par dates décroissantes, sans type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '1',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['2'],
        utilisateurId: '1',
        created_at: new Date(456),
      },
    });

    const suivis = await suiviRepository.listAllSuivi('1');
    expect(suivis.alimentation).toHaveLength(1);
    expect(suivis.transports).toHaveLength(1);
    expect(suivis.alimentation[0].viande_rouge).toStrictEqual(1);
    expect(suivis.transports[0].km_voiture).toStrictEqual(2);
  });

  it('liste par type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        attributs: ['viande_rouge'],
        valeurs: ['2'],
        utilisateurId: '1',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['10'],
        utilisateurId: '1',
        created_at: new Date(456),
      },
    });

    const suivis = await suiviRepository.listAllSuivi('1', 'alimentation');
    expect(suivis.alimentation).toHaveLength(1);
    expect(suivis.transports).toHaveLength(0);
    expect(suivis.alimentation[0].viande_rouge).toStrictEqual(2);
  });
});
