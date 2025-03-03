import {
  SourceInscription,
  Utilisateur,
} from '../../src/domain/utilisateur/utilisateur';
import {
  CLE_PERSO,
  Personnalisator,
} from '../../src/infrastructure/personnalisation/personnalisator';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../TestUtil';

describe('Personalisation', () => {
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const personnalisation = new Personnalisator(communeRepository);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('perso : ne touche pas une chaine quelconque', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );

    const test_data = { yo: '123' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({ yo: '123' });
  });
  it('perso : ne bug pas sur undefined , null, et autres types', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );

    const test_data = { yo: undefined, yi: null, ya: true };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({ yo: undefined, yi: null, ya: true });
  });
  it('perso : remplace COMMUNE OK', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: '{COMMUNE}', b: 'The {COMMUNE}' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({
      a: 'Sennecey-lès-Dijon',
      b: 'The Sennecey-lès-Dijon',
    });
  });
  it('perso : remplace CODE POSTAL OK', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: '{CODE_POSTAL}' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({
      a: '21800',
    });
  });
  it('perso : remplace pas CODE POSTAL si disable', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: '{CODE_POSTAL}' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user, [
      CLE_PERSO.code_postal,
    ]);

    // THEN
    expect(result).toStrictEqual({
      a: '{CODE_POSTAL}',
    });
  });
  it('perso : remplace pas COMMUNE si disable', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: '{COMMUNE}', b: 'The {COMMUNE}' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user, [
      CLE_PERSO.commune,
    ]);

    // THEN
    expect(result).toStrictEqual({ a: '{COMMUNE}', b: 'The {COMMUNE}' });
  });
  it('perso : remplace espace insécable OK', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );

    const test_data = { a: 'Comment ça va ?' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({
      a: 'Comment ça va ?',
    });
  });
  it('perso : ne remplace pas espace insécable OK si on dit que non', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );

    const test_data = { a: 'Comment ça va ?' };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user, [
      CLE_PERSO.espace_insecable,
    ]);

    // THEN
    expect(result).toStrictEqual({
      a: 'Comment ça va ?',
    });
  });
  it('perso : remplace COMMUNE dans un sous objet', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { a: { the_commune: '{COMMUNE}' } };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({
      a: { the_commune: 'Sennecey-lès-Dijon' },
    });
  });
  it('perso : remplace COMMUNE dans une liste de objets', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = [
      { the_commune: '{COMMUNE}' },
      { the_commune: 'haha {COMMUNE}' },
    ];

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual([
      { the_commune: 'Sennecey-lès-Dijon' },
      { the_commune: 'haha Sennecey-lès-Dijon' },
    ]);
  });
  it('perso : remplace COMMUNE dans une liste de strings', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = [`toto {COMMUNE}`, '91120'];

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual([`toto Sennecey-lès-Dijon`, '91120']);
  });
  it('perso : préserve les dates', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'g@www.com',
      false,
      SourceInscription.inconnue,
    );
    user.logement.code_postal = '21800';
    user.logement.commune = 'SENNECEY LES DIJON';

    const test_data = { done_at: new Date(1) };

    // WHEN
    const result = personnalisation.personnaliser(test_data, user);

    // THEN
    expect(result).toStrictEqual({ done_at: new Date(1) });
  });
});
