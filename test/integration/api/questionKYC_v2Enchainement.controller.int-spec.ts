import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import {
  MosaicKYC_CATALOGUE,
  MosaicKYCDef,
  TypeMosaic,
} from '../../../src/domain/kyc/mosaicKYC';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Tag } from '../../../src/domain/scoring/tag';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { QuestionKYCEnchainementUsecase } from '../../../src/usecase/questionKYCEnchainement.usecase';
import { DB, TestUtil } from '../../TestUtil';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  last_update: undefined,
  id_cms: 11,
  question: `question`,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.test,
  points: 10,
  reponse_complexe: [
    {
      label: 'Le climat',
      code: Thematique.climat,
      selected: true,
    },
    {
      label: 'Mon logement',
      code: Thematique.logement,
      selected: false,
    },
  ],
  reponse_simple: undefined,
  tags: [TagUtilisateur.appetence_bouger_sante],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: { abreviation: 'kg' },
  emoji: '🔥',
};

const dbKYC: KYC = {
  id_cms: 1,
  categorie: Categorie.recommandation,
  code: '1',
  is_ngc: true,
  a_supprimer: false,
  points: 20,
  question: 'The question !',
  tags: [Tag.possede_voiture],
  thematique: Thematique.alimentation,
  type: TypeReponseQuestionKYC.choix_unique,
  ngc_key: 'a . b . c',
  reponses: [
    { label: 'Oui', code: 'oui' },
    { label: 'Non', code: 'non' },
    { label: 'Je sais pas', code: 'sais_pas' },
  ],
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  created_at: undefined,
  updated_at: undefined,
  unite: { abreviation: 'kg' },
  emoji: '🔥',
};

const backup = MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE;
const backup_enchainement = QuestionKYCEnchainementUsecase.ENCHAINEMENTS;

describe('/utilisateurs/id/enchainementQuestionsKYC_v2 (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = backup;
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = backup_enchainement;
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = backup;
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = backup_enchainement;
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - liste un enchainement de quesitions', async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    };

    const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID.KYC002, KYCID.KYC003],
        thematique: Thematique.alimentation,
      },
    ];

    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      short_question: 'short 1',
      image_url: 'AAA',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      short_question: 'short 2',
      image_url: 'BBB',
      code: KYCID.KYC002,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      short_question: 'short 3',
      image_url: 'CCC',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur);
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
    expect(response.body).toEqual([
      {
        code: 'KYC001',
        question: 'quest 1',
        is_answered: false,
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        categorie: 'recommandation',
        points: 20,
        type: 'choix_unique',
        is_NGC: true,
        thematique: 'alimentation',
      },
      {
        code: 'TEST_MOSAIC_ID',
        question: 'Titre test',
        is_NGC: false,
        reponse_multiple: [
          {
            code: 'KYC002',
            image_url: 'BBB',
            label: 'short 2',
            emoji: '🔥',
            unite: { abreviation: 'kg' },
            selected: false,
          },
          {
            code: 'KYC003',
            image_url: 'CCC',
            label: 'short 3',
            emoji: '🔥',
            unite: { abreviation: 'kg' },
            selected: false,
          },
        ],
        categorie: 'test',
        points: 10,
        type: 'mosaic_boolean',
        is_answered: false,
        thematique: 'alimentation',
      },
    ]);
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - enchainement qui existe pas', async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    };

    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/BAD',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "L'enchainement d'id [BAD] n'existe pas",
    );
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - premier element d'un enchainement, même si répondu`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, KYCID.KYC003],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 3,
      position_courante: 1,
      position_courante_parmi_eligibles: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC001',
        is_NGC: true,
        is_answered: true,
        points: 20,
        question: 'quest 1',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: true,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first_to_answer - premier element d'un enchainement non répondu`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, KYCID.KYC003],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first_to_answer',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 3,
      position_courante: 2,
      position_courante_parmi_eligibles: 2,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC002',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 2',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first_to_answer_eligible - premier element d'un enchainement non répondu et eligible`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, KYCID.KYC003],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first_to_answer_eligible',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 2,
      position_courante: 3,
      position_courante_parmi_eligibles: 2,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 3',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first_to_answer_eligible - premier element d'un enchainement eligible`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC002, KYCID.KYC003, KYCID.KYC004],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: KYCID.KYC004,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first_eligible',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 2,
      position_courante: 2,
      position_courante_parmi_eligibles: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 3',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following_eligible/XXX - element suivant d'un enchainement eligible`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [
        KYCID.KYC001,
        KYCID.KYC002,
        KYCID.KYC003,
        KYCID.KYC004,
      ],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: KYCID.KYC004,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/following_eligible/KYC001',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 4,
      nombre_total_questions_eligibles: 2,
      position_courante: 4,
      position_courante_parmi_eligibles: 2,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC004',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 4',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following_eligible/XXX - dépasse dernier élément`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
    });

    await TestUtil.create(DB.utilisateur);
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/following_eligible/KYC002',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 2,
      nombre_total_questions_eligibles: 2,
      position_courante: -1,
      position_courante_parmi_eligibles: -1,
      is_first: false,
      is_last: false,
      is_out_of_range: true,
      is_eligible: false,
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/preceding_eligible/XXX - element precedent d'un enchainement eligible`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [
        KYCID.KYC001,
        KYCID.KYC002,
        KYCID.KYC003,
        KYCID.KYC004,
      ],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: KYCID.KYC004,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/preceding_eligible/KYC004',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 4,
      nombre_total_questions_eligibles: 3,
      position_courante: 3,
      position_courante_parmi_eligibles: 2,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 3',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/preceding/XXX - element precedent d'un enchainement eligible, saute la quesiton non eligible`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, KYCID.KYC003],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/preceding_eligible/KYC003',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 2,
      position_courante: 1,
      position_courante_parmi_eligibles: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      is_eligible: true,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC001',
        is_NGC: true,
        is_answered: true,
        points: 20,
        question: 'quest 1',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: true,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/preceding/XXX - element precedent d'un enchainement`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, KYCID.KYC003],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/preceding/KYC003',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_eligibles: 2,
      position_courante: 2,
      position_courante_parmi_eligibles: -1,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      is_eligible: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC002',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 2',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following/XXX - element suivant d'un enchainement`, async () => {
    // GIVEN
    QuestionKYCEnchainementUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [
        KYCID.KYC001,
        KYCID.KYC002,
        KYCID.KYC003,
        KYCID.KYC004,
      ],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC001,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: KYCID.KYC002,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: KYCID.KYC003,
      conditions: [[{ id_kyc: 1, code_reponse: 'non' }]],
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: KYCID.KYC004,
    });

    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/following/KYC001',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 4,
      nombre_total_questions_eligibles: 2,
      position_courante: 2,
      position_courante_parmi_eligibles: -1,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      is_eligible: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC002',
        is_NGC: true,
        is_answered: false,
        points: 20,
        question: 'quest 2',
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        thematique: 'alimentation',
        type: 'choix_unique',
      },
    });
  });
});
