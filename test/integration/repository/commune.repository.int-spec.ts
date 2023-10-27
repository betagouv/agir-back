import { TestUtil } from '../../TestUtil';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';

describe('CommuneRepository', () => {
  let communeRepository = new CommuneRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('checkCodePostal : revoie true si le code postal existe', async () => {
    // WHEN
    const result = await communeRepository.checkCodePostal('91120');

    // THEN
    expect(result).toStrictEqual(true);
  });
  it('checkCodePostal : revoie false si le code postal non existant', async () => {
    // WHEN
    const result = await communeRepository.checkCodePostal('99999');

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('getListCommunesParCodePostal : revoie liste vide si le code postal non existant', async () => {
    // WHEN
    const result = await communeRepository.getListCommunesParCodePostal(
      '99999',
    );

    // THEN
    expect(result).toHaveLength(0);
  });
  it('getListCommunesParCodePostal : revoie bonne liste si le code postal ok', async () => {
    // WHEN
    const result = await communeRepository.getListCommunesParCodePostal(
      '26290',
    );

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toStrictEqual(['DONZERE', 'LES GRANGES GONTARDES']);
  });
  it('getListCommunesParCodePostal : supprime les doublons', async () => {
    // GIVEN
    const toClean = {
      '10330': [
        {
          INSEE: '10333',
          commune: 'The_commune',
          acheminement: 'ST ANDRE LES VERGERS',
          Ligne_5: 'lieu dit 1',
        },
        {
          INSEE: '10334',
          commune: 'The_commune',
          acheminement: 'ST ANDRE LES VERGERS',
          Ligne_5: 'lieu dit 2',
        },
      ],
    };
    // WHEN
    communeRepository.supprimernDoublonsCommunesEtLigne5(toClean);

    // THEN
    expect(toClean['10330']).toHaveLength(1);
    expect(toClean['10330'][0].commune).toEqual('The_commune');
    expect(toClean['10330'][0].Ligne_5).toBeUndefined();
  });
  it('getListCommunesParCodePostal : supprime les doublons du fichier chargé', async () => {
    // WHEN
    const result = await communeRepository.getListCommunesParCodePostal(
      '10120',
    );

    // THEN
    expect(result).toHaveLength(4); // au lieu de 6 à cause de lieux dits
  });
});
