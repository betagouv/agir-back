import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { Personnalisator } from '../../../src/infrastructure/personnalisation/personnalisator';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { MesAidesRenoUsecase } from '../../../src/usecase/mesAidesReno.usecase';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('Mes Aides Réno', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const usecase = new MesAidesRenoUsecase(
    utilisateurRepository,
    communeRepository,
    new QuestionKYCUsecase(
      utilisateurRepository,
      new Personnalisator(communeRepository),
    ),
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

  describe('updateUtilisateurWith', () => {
    test.only("propriétaire d'une maison principale à Toulouse", async () => {
      await TestUtil.create(DB.utilisateur, {
        logement: {
          version: 0,
          superficie: Superficie.superficie_150,
          type: TypeLogement.appartement,
          code_postal: '91120',
          chauffage: Chauffage.bois,
          commune: 'PALAISEAU',
          dpe: DPE.B,
          nombre_adultes: 2,
          nombre_enfants: 2,
          plus_de_15_ans: false,
          proprietaire: false,
        },
      });
      await TestUtil.create(DB.kYC, {
        id_cms: 1,
        code: KYCID.KYC_proprietaire,
        type: TypeReponseQuestionKYC.choix_unique,
        reponses: [
          { code: 'oui', label: 'Oui' },
          { code: 'non', label: 'Non' },
        ],
      });
      await kycRepository.loadCache();

      await usecase.updateUtilisateurWith('utilisateur-id', {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'oui',
        'logement . résidence principale propriétaire': 'oui',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"de 2 à 10 ans"',
        'ménage . personnes': '2',
        'ménage . code région': '"76"',
        'ménage . code département': '"31"',
        'ménage . EPCI': '"243100518"',
        'ménage . commune': '"31555"',
        'ménage . commune . nom': '"Toulouse"',
        'taxe foncière . commune . éligible . ménage': 'non',
        'logement . commune . denormandie': 'non',
        'ménage . revenu': '32197',
        'DPE . actuel': '3',
      });

      const utilisateur = await utilisateurRepository.getById(
        'utilisateur-id',
        [Scope.logement, Scope.kyc],
      );
      console.log('utilisateur:', {
        id: utilisateur.id,
        email: utilisateur.email,
      });
      console.log('logement:', utilisateur.logement);
      console.log('revenu_fiscal:', utilisateur.revenu_fiscal);
      console.log('code_commune:', utilisateur.code_commune);
      console.log('nbPerssones:', utilisateur.getNombrePersonnesDansLogement());

      expect(utilisateur.logement.dpe).toEqual(DPE.C);
      expect(utilisateur.logement.proprietaire).toBeTruthy();
    });
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
