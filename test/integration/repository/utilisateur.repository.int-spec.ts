import { TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur.repository';

describe('UtilisateurRepository', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Creates a new utilisateur without ID', async () => {
    // WHEN
    await utilisateurRepository.createUtilisateurByName('bob');
    // THEN
    const utilisateurs = await TestUtil.prisma.utilisateur.findMany({});
    expect(utilisateurs).toHaveLength(1);
    expect(utilisateurs[0].id).toHaveLength(36);
  });
  it('listUtilisateurIds : list utilisateur Ids OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: '1', email: 'email1@truc.com' });
    await TestUtil.create('utilisateur', { id: '2', email: 'email2@truc.com' });
    await TestUtil.create('utilisateur', { id: '3', email: 'email3@truc.com' });

    // WHEN
    const result = await utilisateurRepository.listUtilisateurIds();

    result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    // THEN
    expect(result).toStrictEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
  });
});
