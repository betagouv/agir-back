import { TypeLogement } from '../../../src/domain/logement/logement';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { MesAidesRenoUsecase } from '../../../src/usecase/mesAidesReno.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('MesAidesRenoRepository', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const usecase = new MesAidesRenoUsecase(
    utilisateurRepository,
    communeRepository,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  describe('getIframeUrl', () => {
    test("should return the url without params if the user doesn't exist", async () => {
      const result = await usecase.getIframeUrl('non_existant_id');
      expect(result).toBe(
        'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true',
      );
    });

    test('should correctly parse informations', async () => {
      await TestUtil.create(DB.utilisateur, {
        logement: {
          proprietaire: true,
          plus_de_15_ans: true,
          dpe: 'B',
          type: TypeLogement.appartement,
          nombre_adultes: 2,
          commune: 'TOULOUSE',
          code_postal: '31500',
        },
        revenu_fiscal: 20000,
      });

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result).toBe(
        'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.propri%C3%A9taire+occupant=oui&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22&DPE.actuel=2&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000&logement.type=%22appartement%22&m%C3%A9nage.commune=%2231555%22&m%C3%A9nage.code+r%C3%A9gion=%2276%22&m%C3%A9nage.code+d%C3%A9partement=%2231%22&m%C3%A9nage.EPCI=%2231555%22&logement.commune=31555',
      );
    });

    test('should correctly parse partial informations', async () => {
      await TestUtil.create(DB.utilisateur, {
        logement: {
          proprietaire: true,
          dpe: 'B',
          nombre_adultes: 2,
        },
        revenu_fiscal: 20000,
      });

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result).toBe(
        'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.propri%C3%A9taire+occupant=oui&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&DPE.actuel=2&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000',
      );
    });
  });
});
