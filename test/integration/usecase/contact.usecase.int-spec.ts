import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactUsecase } from '../../../src/usecase/contact.usecase';

describe('ContactUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let brevoRepository = {
    getContactCreationDate: jest.fn(),
    createContact: jest.fn(),
  };

  let contactUsecase = new ContactUsecase(
    utilisateurRepository,
    brevoRepository as any,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    brevoRepository.getContactCreationDate.mockReset();

    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('createMissingContacts : contact déjà existant, set la date BREVO', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_created_at: null,
    });
    brevoRepository.getContactCreationDate.mockImplementation(() => {
      return new Date(123);
    });

    // WHEN
    const result = await contactUsecase.createMissingContacts();

    // THEN
    expect(result).toEqual(['[emailYO] ALREADY THERE']);
    expect(brevoRepository.createContact).toBeCalledTimes(0);
    expect(brevoRepository.getContactCreationDate).toBeCalledTimes(1);
    expect(brevoRepository.getContactCreationDate).toBeCalledWith('emailYO');

    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    expect(userDB.brevo_created_at).toEqual(new Date(123));
  });
  it('createMissingContacts : contact manquant => creation', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_created_at: null,
    });
    brevoRepository.getContactCreationDate.mockImplementation(() => {
      return null;
    });
    brevoRepository.createContact.mockImplementation(() => {
      return true;
    });

    // WHEN
    const result = await contactUsecase.createMissingContacts();

    // THEN
    expect(result).toEqual(['[emailYO] CREATE OK']);
    expect(brevoRepository.getContactCreationDate).toBeCalledTimes(1);
    expect(brevoRepository.getContactCreationDate).toBeCalledWith('emailYO');
    expect(brevoRepository.createContact).toBeCalledTimes(1);
    expect(brevoRepository.createContact).toBeCalledWith(
      'emailYO',
      'utilisateur-id',
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    expect(userDB.brevo_created_at.getTime()).toBeGreaterThan(Date.now() - 200);
  });
  it('createMissingContacts : contact manquant => echec de creation', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_created_at: null,
    });
    brevoRepository.getContactCreationDate.mockImplementation(() => {
      return null;
    });
    brevoRepository.createContact.mockImplementation(() => {
      return false;
    });

    // WHEN
    const result = await contactUsecase.createMissingContacts();

    // THEN
    expect(result).toEqual(['[emailYO] CREATE ECHEC']);
    expect(brevoRepository.createContact).toBeCalledTimes(1);
    expect(brevoRepository.createContact).toBeCalledWith(
      'emailYO',
      'utilisateur-id',
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    expect(userDB.brevo_created_at).toEqual(null);
  });
});
