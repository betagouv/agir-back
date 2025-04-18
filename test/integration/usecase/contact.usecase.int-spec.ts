import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { BrevoResponse } from '../../../src/infrastructure/contact/brevoRepository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ContactUsecase } from '../../../src/usecase/contact.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('ContactUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let brevoRepository = {
    getContactCreationDate: jest.fn(),
    updateContact: jest.fn(),
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
    brevoRepository.updateContact.mockReset();
    brevoRepository.createContact.mockReset();

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
    expect(brevoRepository.createContact).toHaveBeenCalledTimes(0);
    expect(brevoRepository.getContactCreationDate).toHaveBeenCalledTimes(1);
    expect(brevoRepository.getContactCreationDate).toHaveBeenCalledWith(
      'emailYO',
    );

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
    expect(brevoRepository.getContactCreationDate).toHaveBeenCalledTimes(1);
    expect(brevoRepository.getContactCreationDate).toHaveBeenCalledWith(
      'emailYO',
    );
    expect(brevoRepository.createContact).toHaveBeenCalledTimes(1);
    expect(brevoRepository.createContact).toHaveBeenCalledWith(
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
    expect(brevoRepository.createContact).toHaveBeenCalledTimes(1);
    expect(brevoRepository.createContact).toHaveBeenCalledWith(
      'emailYO',
      'utilisateur-id',
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    expect(userDB.brevo_created_at).toEqual(null);
  });
  it('batchUpdate : cas passant OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_updated_at: null,
      brevo_created_at: new Date(),
      brevo_update_disabled: false,
    });
    brevoRepository.updateContact.mockImplementation(() => {
      return BrevoResponse.ok;
    });

    // WHEN
    const result = await contactUsecase.batchUpdate();

    // THEN
    expect(result).toEqual(['Updated Brevo contact [emailYO] ok']);
    expect(brevoRepository.updateContact).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.brevo_updated_at.getTime()).toBeGreaterThan(Date.now() - 200);
  });
  it('batchUpdate : cas passant KO par pas de date de creation', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_updated_at: null,
      brevo_created_at: null,
      brevo_update_disabled: false,
    });
    brevoRepository.updateContact.mockImplementation(() => {
      return BrevoResponse.ok;
    });

    // WHEN
    const result = await contactUsecase.batchUpdate();

    // THEN
    expect(result).toEqual([]);
  });
  it('batchUpdate : cas disabled', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_updated_at: null,
      brevo_created_at: new Date(),
      brevo_update_disabled: false,
    });
    brevoRepository.updateContact.mockImplementation(() => {
      return BrevoResponse.disabled;
    });

    // WHEN
    const result = await contactUsecase.batchUpdate();

    // THEN
    expect(result).toEqual(['SKIP updating Brevo contact [emailYO]']);
    expect(brevoRepository.updateContact).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.brevo_updated_at).toEqual(null);
  });
  it('batchUpdate : cas erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_updated_at: null,
      brevo_created_at: new Date(),
      brevo_update_disabled: false,
    });
    brevoRepository.updateContact.mockImplementation(() => {
      return BrevoResponse.error;
    });

    // WHEN
    const result = await contactUsecase.batchUpdate();

    // THEN
    expect(result).toEqual(['ECHEC updating Brevo contact [emailYO]']);
    expect(brevoRepository.updateContact).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.brevo_updated_at).toEqual(null);
  });
  it('batchUpdate : cas erreur permanente', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'emailYO',
      brevo_updated_at: null,
      brevo_created_at: new Date(),
      brevo_update_disabled: false,
    });
    brevoRepository.updateContact.mockImplementation(() => {
      return BrevoResponse.permanent_error;
    });

    // WHEN
    const result = await contactUsecase.batchUpdate();

    // THEN
    expect(result).toEqual([
      'PERMANENT ERROR updating Brevo contact [emailYO]',
    ]);
    expect(brevoRepository.updateContact).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.brevo_updated_at).toEqual(null);
    expect(userDB.brevo_update_disabled).toEqual(true);
  });
});
