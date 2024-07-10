import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { Personnalisator } from '../../src/infrastructure/personnalisation/personnalisator';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../../test/TestUtil';

describe('Personalisation', () => {
  const communeRepository = new CommuneRepository();
  const personnalisation = new Personnalisator(communeRepository);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('perso : ne touche pas une chaine quelconque', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'W',
      'George',
      'g@www.com',
      1234,
      '91120',
      'PALAISEAU',
      false,
    );

    const test_data = { yo: '123' };

    // WHEN
    personnalisation.personnaliser(test_data, user);

    // THEN
    expect(test_data).toStrictEqual({ yo: '123' });
  });
  it('perso : ne bug pas sur undefined , null, et autres types', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'W',
      'George',
      'g@www.com',
      1234,
      '91120',
      'PALAISEAU',
      false,
    );

    const test_data = { yo: undefined, yi: null, ya: true };

    // WHEN
    personnalisation.personnaliser(test_data, user);

    // THEN
    expect(test_data).toStrictEqual({ yo: undefined, yi: null, ya: true });
  });
  it('perso : remplace COMMUNE OK', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'W',
      'George',
      'g@www.com',
      1234,
      '91120',
      'PALAISEAU',
      false,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: '{COMMUNE}', b: 'The {COMMUNE}' };

    // WHEN
    personnalisation.personnaliser(test_data, user);

    // THEN
    expect(test_data).toStrictEqual({
      a: 'Sennecey-lès-Dijon',
      b: 'The Sennecey-lès-Dijon',
    });
  });
  it('perso : remplace COMMUNE dans un sous objet', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'W',
      'George',
      'g@www.com',
      1234,
      '91120',
      'PALAISEAU',
      false,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: { the_commune: '{COMMUNE}' } };

    // WHEN
    personnalisation.personnaliser(test_data, user);

    // THEN
    expect(test_data).toStrictEqual({
      a: { the_commune: 'Sennecey-lès-Dijon' },
    });
  });
  it('perso : remplace COMMUNE dans une liste de objets', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'W',
      'George',
      'g@www.com',
      1234,
      '91120',
      'PALAISEAU',
      false,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = [
      { the_commune: '{COMMUNE}' },
      { the_commune: 'haha {COMMUNE}' },
    ];

    // WHEN
    personnalisation.personnaliser(test_data, user);

    // THEN
    expect(test_data).toStrictEqual([
      { the_commune: 'Sennecey-lès-Dijon' },
      { the_commune: 'haha Sennecey-lès-Dijon' },
    ]);
  });
});
