import { TestUtil } from '../../TestUtil';
import {UtilisateurRepository} from '../../../src/infrastructure/repository/utilisateur.repository';

describe('UtilisateurRepository', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('Creates a new utilisateur without ID', async () => {
    await utilisateurRepository.createUtilisateur("bob");
    const utilisateurs = await TestUtil.prisma.utilisateur.findMany({});
    expect(utilisateurs).toHaveLength(1);
    expect(utilisateurs[0].id).toHaveLength(36);
  });

  it('Creates a new utilisateur with id', async () => {
    await utilisateurRepository.createUtilisateur("bob", "123");
    const utilisateurs = await TestUtil.prisma.utilisateur.findMany({});
    expect(utilisateurs).toHaveLength(1);
    expect(utilisateurs[0].id).toEqual("123");
  });

  it('fails to create a new utilisateur cause utilisateur id already exists', async () => {
    await TestUtil.prisma.utilisateur.create({data: {id: '1', name: "bob"}});
    try {
      await utilisateurRepository.createUtilisateur("legeorge", "1");
    } catch (error) {
      expect(error.message).toEqual("Un utilisateur d'id 1 existe déjà en base");
      return;
    }
    fail('expected error');
  });
  
  it('read a missing utilisateur', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob"
        }
    });
    const utilisateurs = await utilisateurRepository.findFirstUtilisateursByName("george");
    expect(utilisateurs).toBeNull();
  });

});
