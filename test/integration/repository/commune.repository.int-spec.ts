import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../../TestUtil';

describe('CommuneRepository', () => {
  let communeRepository = new CommuneRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('NOm upper case commune par code insee ', async () => {
    // WHEN
    const result = CommuneRepository.getLibelleCommuneUpperCase('21231');

    // THEN
    expect(result).toStrictEqual('DIJON');
  });

  it('checkCodePostal : revoie true si le code postal existe', async () => {
    // WHEN
    try {
      CommuneRepository.checkCodePostalExists('91120');
    } catch (error) {
      fail();
    }
  });
  it('checkCodePostal : revoie false si le code postal non existant', async () => {
    // WHEN
    try {
      CommuneRepository.checkCodePostalExists('99999');
      fail();
    } catch (error) {
      expect(error.code).toEqual('077');
    }
  });
  it('getListCommunesParCodePostal : revoie liste vide si le code postal non existant', async () => {
    // WHEN
    const result = communeRepository.getListNomsCommunesParCodePostal('99999');

    // THEN
    expect(result).toHaveLength(0);
  });
  it('getListCommunesParCodePostal : revoie bonne liste si le code postal ok', async () => {
    // WHEN
    const result = communeRepository.getListNomsCommunesParCodePostal('26290');

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
    const result = communeRepository.getListNomsCommunesParCodePostal('10120');

    // THEN
    expect(result).toHaveLength(4); // au lieu de 6 à cause de lieux dits
  });

  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la metropole quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '29280',
        'METRO',
      );

    // THEN
    expect(result).toEqual(['Brest Métropole']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match metropole', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '77650',
        'METRO',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la CA quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01100',
        'CA',
      );

    // THEN
    expect(result).toEqual(['CA Haut-Bugey Agglomération']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match CA', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01260',
        'CA',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la CC quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01300',
        'CC',
      );

    // THEN
    expect(result).toEqual(['CC Bugey Sud']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match CC', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01170',
        'CC',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it(`getListeCodesCommuneParCodeEPCI : listes communes d'une EPCI`, async () => {
    // WHEN
    const result =
      communeRepository.getListeCodesCommuneParCodeEPCI('242100410');

    // THEN
    expect(result).toHaveLength(23);
    expect(result).toContain('21605');
  });
  it.skip(`upsertCommuneAndEpciToDatabase : intègres les EPIC et commune en BDD - trop long`, async () => {
    // WHEN
    const time = Date.now();
    await communeRepository.upsertCommuneAndEpciToDatabase();
    console.log(Date.now() - time);

    // THEN
    const communeDB = await TestUtil.prisma.communesAndEPCI.findUnique({
      where: { code_insee: '06088' },
    });

    expect(communeDB.code_postaux).toEqual([
      '06000',
      '06100',
      '06200',
      '06300',
    ]);
    expect(communeDB.nom).toEqual('Nice');
    expect(communeDB.is_epci).toEqual(false);
    expect(communeDB.is_commune).toEqual(true);
    expect(communeDB.codes_communes).toEqual([]);
    expect(communeDB.type_epci).toEqual(null);

    const epicDB = await TestUtil.prisma.communesAndEPCI.findUnique({
      where: { code_insee: '242100410' },
    });
    expect(epicDB.code_postaux).toEqual([
      '21000',
      '21300',
      '21240',
      '21800',
      '21121',
      '21600',
      '21850',
      '21160',
      '21370',
      '21560',
      '21110',
    ]);
    expect(epicDB.codes_communes).toEqual([
      '21231',
      '21166',
      '21617',
      '21171',
      '21515',
      '21278',
      '21355',
      '21540',
      '21390',
      '21452',
      '21485',
      '21481',
      '21605',
      '21263',
      '21473',
      '21003',
      '21223',
      '21315',
      '21105',
      '21106',
      '21370',
      '21192',
      '21270',
    ]);
    expect(epicDB.nom).toEqual('Dijon Métropole');
    expect(epicDB.is_epci).toEqual(true);
    expect(epicDB.is_commune).toEqual(false);
    expect(epicDB.type_epci).toEqual('METRO');
  });

  it.skip(`test : listes communes d'une EPCI`, async () => {
    // WHEN

    const res1 = communeRepository.getListCommunesParCodePostal('51150');
    const res2 = communeRepository.getListCommunesParCodePostal('51400');
    const res3 = communeRepository.getListCommunesParCodePostal('51320');
    const res4 = communeRepository.getListCommunesParCodePostal('51000');
    const res5 = communeRepository.getListCommunesParCodePostal('51510');
    const res6 = communeRepository.getListCommunesParCodePostal('51460');
    const res7 = communeRepository.getListCommunesParCodePostal('51230');
    const res8 = communeRepository.getListCommunesParCodePostal('51470');
    const res9 = communeRepository.getListCommunesParCodePostal('51520');
    const res10 = communeRepository.getListCommunesParCodePostal('51320');

    const result = res1.concat(
      res2,
      res3,
      res4,
      res5,
      res6,
      res7,
      res8,
      res9,
      res10,
    );

    const EPCI_set_commune =
      communeRepository.getListeCodesCommuneParCodeEPCI('200067213');

    for (const code_commune of EPCI_set_commune) {
      const found1 = res1.find((a) => a.code === code_commune);
      const found2 = res2.find((a) => a.code === code_commune);
      const found3 = res3.find((a) => a.code === code_commune);
      const found4 = res4.find((a) => a.code === code_commune);
      const found5 = res5.find((a) => a.code === code_commune);
      const found6 = res6.find((a) => a.code === code_commune);
      const found7 = res7.find((a) => a.code === code_commune);
      const found8 = res8.find((a) => a.code === code_commune);
      const found9 = res9.find((a) => a.code === code_commune);
      const found10 = res10.find((a) => a.code === code_commune);
      if (found1) {
        console.log(`${JSON.stringify(found1)} in 51150`);
      }
      if (found2) {
        console.log(`${JSON.stringify(found2)} in 51400`);
      }
      if (found3) {
        console.log(`${JSON.stringify(found3)} in 51320`);
      }
      if (found4) {
        console.log(`${JSON.stringify(found4)} in 51000`);
      }
      if (found5) {
        console.log(`${JSON.stringify(found5)} in 51510`);
      }
      if (found6) {
        console.log(`${JSON.stringify(found6)} in 51460`);
      }
      if (found7) {
        console.log(`${JSON.stringify(found7)} in 51230`);
      }
      if (found8) {
        console.log(`${JSON.stringify(found8)} in 51470`);
      }
      if (found9) {
        console.log(`${JSON.stringify(found9)} in 51520`);
      }
      if (found9) {
        console.log(`${JSON.stringify(found10)} in 51320`);
      }
    }
  });

  describe('getCommuneByCodeINSEE', () => {
    test('doit retourner la commune pour un code INSEE valide', async () => {
      // WHEN
      const result =
        communeRepository.getCommuneByCodeINSEESansArrondissement('21231');

      // THEN
      expect(result).toBeDefined();
      expect(result.code).toEqual('21231');
      expect(result.nom).toEqual('Dijon');
    });

    test('doit retourner undefined pour un code INSEE invalide', async () => {
      // WHEN
      const result =
        communeRepository.getCommuneByCodeINSEESansArrondissement('99999');

      // THEN
      expect(result).toBeUndefined();
    });

    test('doit retourner undefined pour un code INSEE undefined', async () => {
      // WHEN
      const result =
        communeRepository.getCommuneByCodeINSEESansArrondissement(undefined);

      // THEN
      expect(result).toBeUndefined();
    });

    test('doit retourner la commune pour un code INSEE correspondant à un arrondissement', async () => {
      // WHEN
      const result =
        communeRepository.getCommuneByCodeINSEESansArrondissement('75101');

      // THEN
      expect(result).toHaveProperty('code', '75056');
      expect(result).toHaveProperty('nom', 'Paris');
    });
  });
});
