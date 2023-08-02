import { TestUtil } from '../../TestUtil';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviType } from '../../../src/domain/suivi/suiviType';

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
    expect(suivis[0].type).toEqual('alimentation');
    expect(suivis[0].data['viande_rouge']).toEqual(2);
  });

  it('erreur de type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '1', name: 'bob' },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'bad_type',
        data: {
          viande_rouge: 1,
        },
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
        type: SuiviType.alimentation,
        data: {
          viande_rouge: 1,
        },
        utilisateurId: '1',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: SuiviType.transport,
        data: {
          km_voiture: 2,
        },
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

  it('liste et ventile par type', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
    });
    await TestUtil.create('suivi', {
      id: '3',
      type: 'transport',
    });

    const suivis = await suiviRepository.listAllSuivi('utilisateur-id');
    expect(suivis.alimentation).toHaveLength(1);
    expect(suivis.transports).toHaveLength(2);
  });

  it('liste et filtre par type', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
    });
    await TestUtil.create('suivi', {
      id: '3',
      type: 'transport',
    });

    const suivis = await suiviRepository.listAllSuivi(
      'utilisateur-id',
      SuiviType.transport,
    );
    expect(suivis.alimentation).toHaveLength(0);
    expect(suivis.transports).toHaveLength(2);
  });

  it('liste les X derniers suivis', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', { id: '1' });
    await TestUtil.create('suivi', { id: '2' });
    await TestUtil.create('suivi', { id: '3' });
    await TestUtil.create('suivi', { id: '4' });

    const suivis = await suiviRepository.listAllSuivi(
      'utilisateur-id',
      undefined,
      3,
    );
    expect(suivis.mergeAll()).toHaveLength(3);
  });
});
