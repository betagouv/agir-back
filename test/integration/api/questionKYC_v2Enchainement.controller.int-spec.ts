import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeMosaic } from '../../../src/domain/kyc/mosaicKYC';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';

import {
  ActionBilanID,
  ActionSimulateurID,
  TypeAction,
} from '../../../src/domain/actions/typeAction';
import {
  EnchainementDefinition,
  EnchainementID,
} from '../../../src/domain/kyc/enchainementDefinition';
import {
  KYCMosaicID,
  MosaicDefinition,
} from '../../../src/domain/kyc/mosaicDefinition';
import { Tag } from '../../../src/domain/scoring/tag';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
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

describe('/utilisateurs/id/enchainementQuestionsKYC_v2 (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - liste un enchainement de questions', async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: true },
        { id: KYCMosaicID.TEST_MOSAIC_ID, is_mandatory: false },
      ],
    );

    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre test',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID.KYC002, KYCID.KYC003],
      thematique: Thematique.alimentation,
    };

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
        is_skipped: false,
        is_mandatory: true,
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
        is_mandatory: false,
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
        is_skipped: false,
        thematique: 'alimentation',
      },
    ]);
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - enchainement qui existe pas', async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCMosaicID.TEST_MOSAIC_ID, is_mandatory: false },
      ],
    );

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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - ID connu de bilan`, async () => {
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      code: KYCID.KYC_type_logement,
      question: 'Quel est le type de votre logement ?',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      code: KYCID.KYC_menage,
      question: 'Combien de personnes vivent dans votre logement ?',
    });

    const type_code_id = `${TypeAction.bilan}_${ActionBilanID.action_bilan_logement}`;
    await TestUtil.create(DB.action, {
      code: ActionBilanID.action_bilan_logement,
      type: TypeAction.bilan,
      type_code_id,
    });

    await TestUtil.create(DB.utilisateur);
    await kycRepository.loadCache();
    await actionRepository.loadCache();

    const response = await TestUtil.GET(
      `/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/${type_code_id}/first`,
    );

    // THEN$
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 5,
      nombre_total_questions_effectives: 5,
      position_courante: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: KYCID.KYC_type_logement,
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
        points: 20,
        question: 'Quel est le type de votre logement ?',
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - ID de simultateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      code: KYCID.KYC_transport_type_utilisateur,
      question: 'Quel est votre moyen de transport principal ?',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      code: KYCID.KYC_transport_voiture_occasion,
      question: "Votre voiture est-elle d'occasion ?",
    });

    const type_code_id = `${TypeAction.simulateur}_${ActionSimulateurID.action_simulateur_voiture}`;
    await TestUtil.create(DB.action, {
      code: ActionSimulateurID.action_simulateur_voiture,
      type: TypeAction.simulateur,
      type_code_id,
    });

    await TestUtil.create(DB.utilisateur);
    await kycRepository.loadCache();
    await actionRepository.loadCache();

    const response = await TestUtil.GET(
      `/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/${type_code_id}/first`,
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 2,
      nombre_total_questions_effectives: 2,
      position_courante: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: KYCID.KYC_transport_type_utilisateur,
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
        points: 20,
        question: 'Quel est votre moyen de transport principal ?',
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - premier element d'un enchainement non répondu`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      nombre_total_questions_effectives: 3,
      position_courante: 2,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC002',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - premier element d'un enchainement quand tout est déjà répondu`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
        {
          ...KYC_DATA,
          code: KYCID.KYC002,
          id_cms: 2,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: false },
            { label: 'Non', code: 'non', selected: true },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
        {
          ...KYC_DATA,
          code: KYCID.KYC003,
          id_cms: 3,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: false },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: true },
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
      nombre_total_questions_effectives: 3,
      position_courante: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC001',
        is_NGC: true,
        is_answered: true,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first_to_answer_eligible - premier element d'un enchainement non répondu et eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_effectives: 2,
      position_courante: 2,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/first - premier element d'un enchainement eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/first',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 3,
      nombre_total_questions_effectives: 2,
      position_courante: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following_eligible/following - element suivant d'un enchainement eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      nombre_total_questions_effectives: 2,
      position_courante: 2,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC004',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following zappe une non eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC002,
          id_cms: 2,
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
      conditions: [[{ id_kyc: 2, code_reponse: 'non' }]],
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
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/following/KYC002',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 4,
      nombre_total_questions_effectives: 3,
      position_courante: 3,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC004',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following - element deja repondu renvoyé quand même`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC002,
          id_cms: 2,
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
      conditions: [[{ id_kyc: 2, code_reponse: 'non' }]],
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
      nombre_total_questions_effectives: 3,
      position_courante: 2,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC002',
        is_NGC: true,
        is_answered: true,
        is_mandatory: false,
        is_skipped: false,
        points: 20,
        question: 'quest 2',
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following - dépasse dernier élément`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
      ],
    );

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
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/following/KYC002',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 2,
      nombre_total_questions_effectives: 2,
      position_courante: -1,
      is_first: false,
      is_last: false,
      is_out_of_range: true,
    });
  });

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/preceding - recule sur une question deja repondu`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC002,
          id_cms: 2,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            { label: 'Je sais pas', code: 'sais_pas', selected: false },
          ],
        },
        {
          ...KYC_DATA,
          code: KYCID.KYC003,
          id_cms: 3,
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
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1/preceding/KYC004',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_total_questions: 4,
      nombre_total_questions_effectives: 4,
      position_courante: 3,
      is_first: false,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC003',
        is_NGC: true,
        is_answered: true,
        is_mandatory: false,
        is_skipped: false,
        points: 20,
        question: 'quest 3',
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/preceding/XXX - element precedent d'un enchainement, zappe non eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      nombre_total_questions_effectives: 2,
      position_courante: 1,
      is_first: true,
      is_last: false,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC001',
        is_NGC: true,
        is_answered: true,
        is_mandatory: false,
        is_skipped: false,
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

  it(`GET /utilisateurs/id/enchainementQuestionsKYC_v2/id/following/XXX - zapp 2 non eligible`, async () => {
    // GIVEN
    EnchainementDefinition.set_definition_for_test_only(
      EnchainementID.ENCHAINEMENT_KYC_1,
      [
        { id: KYCID.KYC001, is_mandatory: false },
        { id: KYCID.KYC002, is_mandatory: false },
        { id: KYCID.KYC003, is_mandatory: false },
        { id: KYCID.KYC004, is_mandatory: false },
      ],
    );

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

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
      nombre_total_questions_effectives: 2,
      position_courante: 2,
      is_first: false,
      is_last: true,
      is_out_of_range: false,
      question_courante: {
        categorie: 'recommandation',
        code: 'KYC004',
        is_NGC: true,
        is_answered: false,
        is_mandatory: false,
        is_skipped: false,
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
});
