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

  it('read a new utilisateur with its compteur', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob",
         compteurs: {
           create: [
             {
              id: "1" ,
              titre: "thetitre",
               valeur: "89",
             }
           ]
         }
        }
    });
    const utilisateurs = await utilisateurRepository.findUtilisateurByNameWithChildren("bob");
    expect(utilisateurs["compteurs"]).toHaveLength(1);
  });

  it('read a missing utilisateur', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob"
        }
    });
    const utilisateurs = await utilisateurRepository.findUtilisateurByNameWithChildren("george");
    expect(utilisateurs).toBeNull();
  });

});
