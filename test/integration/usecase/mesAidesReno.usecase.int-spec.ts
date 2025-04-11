import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { MesAidesRenoUsecase } from '../../../src/usecase/mesAidesReno.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('Mes Aides Réno', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
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

  describe.only('updateUtilisateurWith', () => {
    test("propriétaire d'une maison principale à Toulouse", async () => {
      await TestUtil.create(DB.utilisateur, {
        revenu_fiscal: 20000,
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
      await createKYCs();
      await kycRepository.loadCache();

      await usecase.updateUtilisateurWith('utilisateur-id', {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'oui',
        'logement . résidence principale propriétaire': 'oui',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"au moins 15 ans"',
        // TODO: what should we do with this one ?
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

      expect(utilisateur.logement.dpe).toEqual(DPE.C);
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_DPE)
          .getReponseComplexeByCode(DPE.C).selected,
      ).toBeTruthy();

      expect(utilisateur.logement.proprietaire).toBeTruthy();
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_proprietaire)
          .getReponseComplexeByCode('oui').selected,
      ).toBeTruthy();

      expect(utilisateur.logement.plus_de_15_ans).toBeTruthy();
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC006)
          .getReponseComplexeByCode('plus_15').selected,
      ).toBeTruthy();
      expect(utilisateur.revenu_fiscal).toEqual(32197);

      expect(utilisateur.getNombrePersonnesDansLogement()).toBe(2);
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_menage)
          .getReponseSimpleValueAsNumber(),
      ).toEqual(2);

      expect(utilisateur.logement.type).toBe(TypeLogement.maison);
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_type_logement)
          .getReponseComplexeByCode(TypeLogement.maison).selected,
      ).toBeTruthy();

      expect(utilisateur.logement.superficie).toBe(Superficie.superficie_35);
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_superficie)
          .getReponseSimpleValueAsNumber(),
      ).toEqual(30);

      expect(utilisateur.code_commune).toEqual('31555');
      expect(utilisateur.logement.commune).toEqual('TOULOUSE');
      expect(utilisateur.logement.code_postal).toEqual('31000');
    });

    test("le logement n'est pas la résidence principale", async () => {
      await TestUtil.create(DB.utilisateur, {
        revenu_fiscal: 20000,
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
      await createKYCs();
      await kycRepository.loadCache();

      await usecase.updateUtilisateurWith('utilisateur-id', {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'non',
        'logement . résidence principale propriétaire': 'non',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"au moins 15 ans"',
        // TODO: what should we do with this one ?
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

      // Ces informations devraient être modifiées car elles concernent le
      // ménage et non le logement.
      expect(utilisateur.code_commune).toEqual('31555');
      expect(utilisateur.revenu_fiscal).toEqual(32197);
      expect(utilisateur.getNombrePersonnesDansLogement()).toBe(2);
      expect(
        utilisateur.kyc_history
          .getAnsweredQuestionByCode(KYCID.KYC_menage)
          .getReponseSimpleValueAsNumber(),
      ).toEqual(2);

      // Ces informations ne devraient pas être modifiées car elles concernent
      // le logement qui n'est pas la résidence principale de l'utilisateurice.
      expect(utilisateur.logement.dpe).toEqual(DPE.B);
      expect(utilisateur.logement.proprietaire).toBeFalsy();
      expect(utilisateur.logement.plus_de_15_ans).toBeFalsy();
      expect(utilisateur.logement.type).toBe(TypeLogement.appartement);
      expect(utilisateur.logement.superficie).toBe(Superficie.superficie_150);

      // FIXME: Ces informations devraient-elles être modifiées ?
      expect(utilisateur.logement.commune).toEqual('PALAISEAU');
      expect(utilisateur.logement.code_postal).toEqual('91120');
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

function createKYCs(): Promise<void[]> {
  return Promise.all([
    TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_proprietaire,
      type: TypeReponseQuestionKYC.choix_unique,
      reponses: [
        { code: 'oui', label: 'Oui' },
        { code: 'non', label: 'Non' },
      ],
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC_DPE,
      type: TypeReponseQuestionKYC.choix_unique,
      reponses: [
        { code: 'A', label: 'A' },
        { code: 'B', label: 'B' },
        { code: 'C', label: 'C' },
        { code: 'D', label: 'D' },
        { code: 'E', label: 'E' },
        { code: 'F', label: 'F' },
        { code: 'G', label: 'G' },
      ],
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 3,
      code: KYCID.KYC_logement_age,
      type: TypeReponseQuestionKYC.entier,
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 4,
      code: KYCID.KYC006,
      type: TypeReponseQuestionKYC.choix_unique,
      reponses: [
        { code: 'moins_15', label: 'Moins de 15 ans (neuf ou récent)' },
        { code: 'plus_15', label: 'Plus de 15 ans' },
      ],
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 5,
      code: KYCID.KYC_menage,
      type: TypeReponseQuestionKYC.entier,
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 6,
      code: KYCID.KYC_type_logement,
      type: TypeReponseQuestionKYC.choix_unique,
      reponses: [
        { code: TypeLogement.appartement, label: 'Appartement' },
        { code: TypeLogement.maison, label: 'Maison' },
      ],
    }),
    TestUtil.create(DB.kYC, {
      id_cms: 7,
      code: KYCID.KYC_superficie,
      type: TypeReponseQuestionKYC.entier,
    }),
  ]);
}
