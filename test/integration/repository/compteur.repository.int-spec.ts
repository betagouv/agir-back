import { TestUtil } from '../../TestUtil';
import {CompteurRepository} from '../../../src/infrastructure/repository/compteur.repository';

describe('CompteurRepository', () => {
  let compteurRepository = new CompteurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })
  it('creates a new compteur ok without id', async () => {
    await TestUtil.prisma.utilisateur.create({ data: { id: '1', name: "bob" }});
    await TestUtil.prisma.dashboard.create({ data: {id : "123", utilisateurId: "1"}});

    const new_compteur = await compteurRepository.create("letitre", "99", "123");
    expect(new_compteur.id).toHaveLength(36); // UUID V4
  });
/**

  it('creates a new compteur ok with id', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const new_compteur = await compteurRepository.create("letitre", "99", "1", "123");
    expect(new_compteur.id).toEqual("123");
  });

  
  it('fails to create a new compteur cause compteur id already existing', async () => {
    await TestUtil.prisma.dashboard.create({
      data: {
         id: '1',
         compteurs: {
           create: [
             {
              id: "123" ,
              titre: "thetitre",
               valeur: "89",
             }
           ]
         }
        }
    });
    try {
      await compteurRepository.create("letitre", "99", "1", "123");
    } catch (error) {
      expect(error.message).toEqual("Un compteur d'id 123 existe déjà en base");
      return;
    }
    fail('expected error');
  });
   */
  /**
  it('fails to create a new compteur cause utilisateur id not existing', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob"
        }
    });
    try {
      await compteurRepository.create("letitre", "99", "2", "123");
    } catch (error) {
      expect(error.message).toEqual("Aucun utilisateur d'id 2 n'existe en base");
      return;
    }
    fail('expected error');
  });
   */
});
