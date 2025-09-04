import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCHistory_v2 } from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Thematique } from '../../../src/domain/thematique/thematique';
import {
  ModeInscription,
  Scope,
  SourceInscription,
  Utilisateur,
} from '../../../src/domain/utilisateur/utilisateur';
import { NGCCalculator } from '../../../src/infrastructure/ngc/NGCCalculator';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { SituationNGCRepository } from '../../../src/infrastructure/repository/situationNGC.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from '../../../src/usecase/bilanCarbone.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('BilanCarboneUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  let nGCCalculator = new NGCCalculator();
  let situationRepository = new SituationNGCRepository(TestUtil.prisma);

  let bilanCarboneUsecase = new BilanCarboneUsecase(
    nGCCalculator,
    utilisateurRepository,
    situationRepository,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    //pushNotificator.pushMessage.mockReset();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('external_inject_situation_to_user_kycs : integration OK, situation vide, catalogue vide', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'yo',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );

    await TestUtil.create(DB.situationNGC, {
      id: '123',
      utilisateurId: user.id,
      created_at: new Date(1),
      updated_at: new Date(1),
      situation: {},
    });
    // WHEN

    await bilanCarboneUsecase.external_inject_situation_to_user_kycs(
      user,
      '123',
    );

    // THEN

    expect(user.kyc_history).toEqual({
      answered_mosaics: [],
      answered_questions: [],
      skipped_mosaics: [],
      skipped_questions: [],
      catalogue: [],
    });
  });

  it('external_inject_situation_to_user_kycs : integration OK, une question', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'yo',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );

    await TestUtil.create(DB.situationNGC, {
      id: '123',
      utilisateurId: user.id,
      created_at: new Date(1),
      updated_at: new Date(1),
      situation: {
        'transport . voiture . km': 20000,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_km,
      type: TypeReponseQuestionKYC.entier,
      is_ngc: true,
      question: `Km en voiture ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [],
      ngc_key: 'transport . voiture . km',
    });

    await kycRepository.loadCache();

    // WHEN

    await bilanCarboneUsecase.external_inject_situation_to_user_kycs(
      user,
      '123',
    );

    // THEN

    const kyc = user.kyc_history.getQuestionNumerique(
      KYCID.KYC_transport_voiture_km,
    );

    expect(kyc.getValue()).toEqual(20000);
    expect(kyc.getKyc().last_update.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it('external_inject_situation_to_user_kycs : integration OK,  n écrase PAS une question déjà répondu', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],
      answered_questions: [
        {
          code: KYCID.KYC_transport_voiture_km,
          sous_titre: 'sous',
          id_cms: 1,
          conditions: [],
          last_update: new Date(1),
          tags: [],
          thematique: Thematique.alimentation,
          a_supprimer: false,
          question: `Combien de km !!`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: undefined,
          reponse_simple: {
            value: '300',
          },
          ngc_key: 'transport . voiture . km',
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    await TestUtil.create(DB.situationNGC, {
      id: '123',
      utilisateurId: user.id,
      created_at: new Date(1),
      updated_at: new Date(1),
      situation: {
        'transport . voiture . km': 20000,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_km,
      type: TypeReponseQuestionKYC.entier,
      is_ngc: true,
      question: `Km en voiture ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [],
      ngc_key: 'transport . voiture . km',
    });

    await kycRepository.loadCache();

    // WHEN
    await bilanCarboneUsecase.external_inject_situation_to_user_kycs(
      user,
      '123',
    );

    const kyc_user = user.kyc_history.getQuestionNumerique(
      KYCID.KYC_transport_voiture_km,
    );

    // THEN
    expect(kyc_user.getValue()).toEqual(300);
  });
});
