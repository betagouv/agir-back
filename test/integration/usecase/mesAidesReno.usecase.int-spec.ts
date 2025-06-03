import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
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

  describe('updateUtilisateurWith', () => {
    test("propriétaire d'une maison principale à Toulouse", async () => {
      const logement: Logement_v0 = {
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
        latitude: undefined,
        longitude: undefined,
        numero_rue: undefined,
        risques: undefined,
        rue: undefined,
        code_commune: undefined,
        score_risques_adresse: undefined,
      };

      await TestUtil.create(DB.utilisateur, {
        revenu_fiscal: 20000,
        logement: logement as any,
      });
      await TestUtil.createKYCLogement();
      await kycRepository.loadCache();

      await usecase.updateUtilisateurWith('utilisateur-id', {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'oui',
        'logement . résidence principale propriétaire': 'oui',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"au moins 15 ans"',
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
        utilisateur.kyc_history.getQuestion(KYCID.KYC_DPE).getSelectedCode(),
      ).toEqual(DPE.C);

      expect(utilisateur.logement.proprietaire).toBeTruthy();
      expect(
        utilisateur.kyc_history
          .getQuestion(KYCID.KYC_proprietaire)
          .getSelectedCode(),
      ).toEqual('oui');

      expect(utilisateur.logement.plus_de_15_ans).toBeTruthy();
      expect(
        utilisateur.kyc_history.getQuestion(KYCID.KYC006).getSelectedCode(),
      ).toEqual('plus_15');
      expect(utilisateur.revenu_fiscal).toEqual(32197);

      expect(utilisateur.getNombrePersonnesDansLogement()).toBe(4);
      expect(
        utilisateur.kyc_history
          .getQuestionNumerique(KYCID.KYC_menage)
          .getValue(),
      ).toEqual(2);

      expect(utilisateur.logement.type).toBe(TypeLogement.maison);
      expect(
        utilisateur.kyc_history
          .getQuestion(KYCID.KYC_type_logement)
          .getSelectedCode(),
      ).toEqual(TypeLogement.maison);

      expect(utilisateur.logement.superficie).toBe(Superficie.superficie_35);
      expect(
        utilisateur.kyc_history
          .getQuestionNumerique(KYCID.KYC_superficie)
          .getValue(),
      ).toEqual(30);

      expect(utilisateur.logement.code_commune).toEqual('31555');
      expect(utilisateur.logement.commune).toEqual('TOULOUSE');
      expect(utilisateur.logement.code_postal).toEqual('31000');
    });

    test("le logement n'est pas la résidence principale", async () => {
      const logement: Logement_v0 = {
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
        latitude: undefined,
        longitude: undefined,
        numero_rue: undefined,
        risques: undefined,
        rue: undefined,
        code_commune: '91477',
        score_risques_adresse: undefined,
      };

      await TestUtil.create(DB.utilisateur, {
        revenu_fiscal: 20000,
        logement: logement as any,
      });
      await TestUtil.createKYCLogement();
      await kycRepository.loadCache();

      await usecase.updateUtilisateurWith('utilisateur-id', {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'non',
        'logement . résidence principale propriétaire': 'non',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"au moins 15 ans"',
        'ménage . personnes': '2',
        'logement . code région': '"76"',
        'logement . code département': '"31"',
        'logement . EPCI': '"243100518"',
        'logement . commune': '"31555"',
        'logement . commune . nom': '"Toulouse"',
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
      expect(utilisateur.revenu_fiscal).toEqual(32197);
      expect(utilisateur.getNombrePersonnesDansLogement()).toBe(4);
      expect(
        utilisateur.kyc_history
          .getQuestionNumerique(KYCID.KYC_menage)
          .getValue(),
      ).toEqual(2);

      // Ces informations ne devraient pas être modifiées car elles concernent
      // le logement qui n'est pas la résidence principale de l'utilisateurice.
      expect(utilisateur.logement.dpe).toEqual(DPE.B);
      expect(utilisateur.logement.proprietaire).toBeFalsy();
      expect(utilisateur.logement.plus_de_15_ans).toBeFalsy();
      expect(utilisateur.logement.type).toBe(TypeLogement.appartement);
      expect(utilisateur.logement.superficie).toBe(Superficie.superficie_150);
      expect(utilisateur.logement.code_commune).toEqual('91477');
      expect(utilisateur.logement.commune).toEqual('PALAISEAU');
      expect(utilisateur.logement.code_postal).toEqual('91120');
    });
  });

  describe('getIframeUrl', () => {
    test("should return the url without params if the user doesn't exist", async () => {
      const result = await usecase.getIframeUrl('non_existant_id');
      expect(result.iframe_url).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr",
      );
      expect(result.iframe_url_deja_faite).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr",
      );
    });

    test('should correctly parse informations', async () => {
      const logement: Logement_v0 = {
        proprietaire: true,
        plus_de_15_ans: true,
        dpe: DPE.B,
        type: TypeLogement.appartement,
        nombre_adultes: 2,
        commune: 'TOULOUSE',
        code_postal: '31500',
        superficie: Superficie.superficie_150,
        chauffage: undefined,
        latitude: undefined,
        longitude: undefined,
        nombre_enfants: undefined,
        numero_rue: undefined,
        risques: undefined,
        rue: undefined,
        version: 0,
        code_commune: undefined,
        score_risques_adresse: undefined,
      };
      await TestUtil.create(DB.utilisateur, {
        logement: logement as any,
        revenu_fiscal: 20000,
      });

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result.iframe_url).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22&logement.propri%C3%A9taire+occupant=oui&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&logement.surface=125&logement.type=%22appartement%22&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000&m%C3%A9nage.commune=%2231555%22&m%C3%A9nage.code+r%C3%A9gion=%2276%22&m%C3%A9nage.code+d%C3%A9partement=%2231%22&m%C3%A9nage.EPCI=%22243100518%22&logement.commune=%2231555%22&logement.commune+d%C3%A9partement=%2231%22&logement.commune+r%C3%A9gion=%2276%22&logement.commune.nom=%22Toulouse%22&logement.code+postal=%2231500%22",
      );
      expect(result.iframe_url_deja_faite).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2*&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22*&logement.propri%C3%A9taire+occupant=oui*&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22*&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui*&logement.surface=125*&logement.type=%22appartement%22*&m%C3%A9nage.personnes=2*&m%C3%A9nage.revenu=20000*&m%C3%A9nage.commune=%2231555%22*&m%C3%A9nage.code+r%C3%A9gion=%2276%22*&m%C3%A9nage.code+d%C3%A9partement=%2231%22*&m%C3%A9nage.EPCI=%22243100518%22*&logement.commune=%2231555%22*&logement.commune+d%C3%A9partement=%2231%22*&logement.commune+r%C3%A9gion=%2276%22*&logement.commune.nom=%22Toulouse%22*&logement.code+postal=%2231500%22*",
      );
    });

    test('superficice from KYC instead of profil', async () => {
      const logement: Logement_v0 = {
        proprietaire: true,
        plus_de_15_ans: true,
        dpe: DPE.B,
        type: TypeLogement.appartement,
        nombre_adultes: 2,
        commune: 'TOULOUSE',
        code_postal: '31500',
        superficie: Superficie.superficie_70,
        chauffage: undefined,
        latitude: undefined,
        longitude: undefined,
        nombre_enfants: undefined,
        numero_rue: undefined,
        risques: undefined,
        rue: undefined,
        version: 0,
        code_commune: undefined,
        score_risques_adresse: undefined,
      };

      await TestUtil.create(DB.utilisateur, {
        logement: logement as any,
        revenu_fiscal: 20000,
      });
      await TestUtil.createKYCLogement();
      await kycRepository.loadCache();

      const utilisateur = await utilisateurRepository.getById(
        'utilisateur-id',
        [Scope.kyc],
      );

      const kyc = utilisateur.kyc_history.getQuestionNumerique(
        KYCID.KYC_superficie,
      );
      kyc.setValue(50);
      utilisateur.kyc_history.updateQuestion(kyc);

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result.iframe_url).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22&logement.propri%C3%A9taire+occupant=oui&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&logement.surface=50&logement.type=%22appartement%22&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000&m%C3%A9nage.commune=%2231555%22&m%C3%A9nage.code+r%C3%A9gion=%2276%22&m%C3%A9nage.code+d%C3%A9partement=%2231%22&m%C3%A9nage.EPCI=%22243100518%22&logement.commune=%2231555%22&logement.commune+d%C3%A9partement=%2231%22&logement.commune+r%C3%A9gion=%2276%22&logement.commune.nom=%22Toulouse%22&logement.code+postal=%2231500%22",
      );
      expect(result.iframe_url_deja_faite).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2*&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22*&logement.propri%C3%A9taire+occupant=oui*&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22*&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui*&logement.surface=50*&logement.type=%22appartement%22*&m%C3%A9nage.personnes=2*&m%C3%A9nage.revenu=20000*&m%C3%A9nage.commune=%2231555%22*&m%C3%A9nage.code+r%C3%A9gion=%2276%22*&m%C3%A9nage.code+d%C3%A9partement=%2231%22*&m%C3%A9nage.EPCI=%22243100518%22*&logement.commune=%2231555%22*&logement.commune+d%C3%A9partement=%2231%22*&logement.commune+r%C3%A9gion=%2276%22*&logement.commune.nom=%22Toulouse%22*&logement.code+postal=%2231500%22*",
      );
    });

    test('should correctly parse partial informations', async () => {
      const logement: Logement_v0 = {
        proprietaire: true,
        dpe: DPE.B,
        nombre_adultes: 2,
        code_postal: undefined,
        commune: undefined,
        plus_de_15_ans: undefined,
        superficie: undefined,
        type: undefined,
        chauffage: undefined,
        latitude: undefined,
        longitude: undefined,
        nombre_enfants: undefined,
        numero_rue: undefined,
        risques: undefined,
        rue: undefined,
        version: 0,
        code_commune: undefined,
        score_risques_adresse: undefined,
      };
      await TestUtil.create(DB.utilisateur, {
        logement: logement as any,
        revenu_fiscal: 20000,
      });

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result.iframe_url).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2&logement.propri%C3%A9taire+occupant=oui&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000",
      );
      expect(result.iframe_url_deja_faite).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&DPE.actuel=2*&logement.propri%C3%A9taire+occupant=oui*&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22*&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui*&m%C3%A9nage.personnes=2*&m%C3%A9nage.revenu=20000*",
      );
    });

    test('doit prendre en compte les communes avec arrondissements', async () => {
      const logement = {
        code_postal: '69006',
        commune: 'LYON 06',
      };
      await TestUtil.create(DB.utilisateur, {
        logement: logement as any,
      });

      const result = await usecase.getIframeUrl('utilisateur-id');
      expect(result.iframe_url).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&m%C3%A9nage.personnes=1&m%C3%A9nage.revenu=10000&m%C3%A9nage.commune=%2269123%22&m%C3%A9nage.code+r%C3%A9gion=%2284%22&m%C3%A9nage.code+d%C3%A9partement=%2269%22&m%C3%A9nage.EPCI=%22200046977%22&logement.commune=%2269123%22&logement.commune+d%C3%A9partement=%2269%22&logement.commune+r%C3%A9gion=%2284%22&logement.commune.nom=%22Lyon%22&logement.code+postal=%2269006%22",
      );
      expect(result.iframe_url_deja_faite).toBe(
        "https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&sendDataToHost=true&hostTitle=J'agis&hostName=jagis.beta.gouv.fr&m%C3%A9nage.personnes=1*&m%C3%A9nage.revenu=10000*&m%C3%A9nage.commune=%2269123%22*&m%C3%A9nage.code+r%C3%A9gion=%2284%22*&m%C3%A9nage.code+d%C3%A9partement=%2269%22*&m%C3%A9nage.EPCI=%22200046977%22*&logement.commune=%2269123%22*&logement.commune+d%C3%A9partement=%2269%22*&logement.commune+r%C3%A9gion=%2284%22*&logement.commune.nom=%22Lyon%22*&logement.code+postal=%2269006%22*",
      );
    });
  });
});
