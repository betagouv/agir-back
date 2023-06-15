import { INestApplication } from '@nestjs/common';
const commons = require('../../test-commons');
import {CompteurRepository} from '../../../src/infrastructure/repository/compteur.repository';

describe('CompteurRepository', () => {
  let app: INestApplication;
  let compteurRepository = new CompteurRepository(commons.prisma);

  beforeAll(async () => {
    app = await commons.appinit();
  });

  beforeEach(async () => {
    await commons.deleteAll();
  })

  afterAll(async () => {
    await commons.appclose();
  })

  it('creates a new compteur ok without id', async () => {
    await commons.db().utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const new_compteur = await compteurRepository.create("letitre", 99, "1");
    expect(new_compteur.id).toHaveLength(36); // UUID V4
  });

  it('creates a new compteur ok with id', async () => {
    await commons.db().utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const new_compteur = await compteurRepository.create("letitre", 99, "1", "123");
    expect(new_compteur.id).toEqual("123");
  });

  it('fails to create a new compteur cause compteur id already existing', async () => {
    await commons.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob",
         compteurs: {
           create: [
             {
              id: "123" ,
              titre: "thetitre",
               valeur: 89,
             }
           ]
         }
        }
    });
    try {
      await compteurRepository.create("letitre", 99, "1", "123");
    } catch (error) {
      expect(error.message).toEqual("Un compteur d'id 123 existe déjà en base");
      return;
    }
    fail('expected error');
  });
  it('fails to create a new compteur cause utilisateur id not existing', async () => {
    await commons.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob"
        }
    });
    try {
      await compteurRepository.create("letitre", 99, "2", "123");
    } catch (error) {
      expect(error.message).toEqual("Aucun utilisateur d'id 2 n'existe en base");
      return;
    }
    fail('expected error');
  });
});
