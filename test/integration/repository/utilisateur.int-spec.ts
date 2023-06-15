import { INestApplication } from '@nestjs/common';
const commons = require('../../test-commons');
import {UtilisateurRepository} from '../../../src/infrastructure/repository/utilisateur.repository';

describe('UtilisateurRepository', () => {
  let app: INestApplication;
  let utilisateurRepository = new UtilisateurRepository(commons.prisma);

  beforeAll(async () => {
    app = await commons.appinit();
  });

  beforeEach(async () => {
    await commons.deleteAll();
  })

  afterAll(async () => {
    await commons.appclose();
  })

  it('read a new utilisateur with its compteur', async () => {
    await commons.prisma.utilisateur.create({
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
    await commons.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob"
        }
    });
    const utilisateurs = await utilisateurRepository.findUtilisateurByNameWithChildren("george");
    expect(utilisateurs).toBeNull();
  });

});
