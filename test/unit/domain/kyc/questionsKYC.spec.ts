import { Thematique } from '../../../../src/domain/contenu/thematique';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../src/domain/kyc/questionKYC';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KycDefinition } from '../../../../src/domain/kyc/kycDefinition';
import { Chauffage, DPE } from '../../../../src/domain/logement/logement';
import { KYCMosaicID } from '../../../../src/domain/kyc/KYCMosaicID';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { QuestionKYC_v1 } from '../../../../src/domain/object_store/kyc/kycHistory_v1';

const QUESTION_TEST: QuestionKYC_v1 = {
  id_cms: 1,
  code: KYCID.KYC001,
  question: `question`,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.recommandation,
  points: 10,
  reponse_complexe: [
    {
      label: 'Le climat',
      code: Thematique.climat,
      value: 'oui',
      ngc_code: '1234',
    },
    {
      label: 'reponse D',
      code: 'D',
      value: undefined,
      ngc_code: '987',
    },
  ],
  tags: [],
  short_question: 'short',
  image_url: 'https://',
  conditions: [],
  unite: Unite.kg,
  emoji: '🔥',
  thematique: Thematique.alimentation,
  reponse_simple: undefined,
};

const KYC_DEF = {
  id_cms: 1,
  categorie: Categorie.recommandation,
  code: KYCID.KYC001,
  is_ngc: false,
  a_supprimer: false,
  points: 10,
  question: 'The question !',
  tags: [Tag.possede_voiture],
  thematique: Thematique.alimentation,
  thematiques: [],
  type: TypeReponseQuestionKYC.choix_multiple,
  ngc_key: 'a . b . c',
  reponses: [{ label: 'CCC', code: Thematique.climat }],
  short_question: 'short',
  image_url: 'https://',
  conditions: [],
  unite: Unite.kg,
  emoji: '🔥',
};

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('areConditionsMatched : true si pas de condition', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [QUESTION_TEST],
    });

    // WHEN
    const result = history.areConditionsMatched([]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si kyc par répondu', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          reponse_complexe: undefined,
          reponse_simple: undefined,
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_reponse: 'climat' }],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si match simple', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_reponse: 'climat' }],
    ]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si non match simple', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: 'climat',
              ngc_code: '123',
              value: 'oui',
            },
            {
              label: 'Le climat',
              code: 'logement',
              ngc_code: '123',
              value: 'non',
            },
          ],
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_reponse: 'logement' }],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si match 2 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
        {
          ...QUESTION_TEST,
          code: KYCID.KYC002,
          id_cms: 2,
          reponse_complexe: [
            {
              label: 'Yo',
              code: 'yo',
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [
        { id_kyc: 1, code_reponse: 'climat' },
        { id_kyc: 2, code_reponse: 'yo' },
      ],
    ]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si non match 2 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
        {
          ...QUESTION_TEST,
          code: KYCID.KYC002,
          id_cms: 2,
          reponse_complexe: [
            {
              label: 'Yo',
              code: 'yo',
              ngc_code: '123',
              value: 'non',
            },
            {
              label: 'Yi',
              code: 'yi',
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [
        { id_kyc: 1, code_reponse: 'climat' },
        { id_kyc: 2, code_reponse: 'ya' },
      ],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si OU match 1 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
        {
          ...QUESTION_TEST,
          code: KYCID.KYC002,
          id_cms: 2,
          reponse_complexe: [
            {
              label: 'Yo',
              code: 'yo',
              ngc_code: '123',
              value: 'non',
            },
            {
              label: 'Yi',
              code: 'yi',
              ngc_code: '123',
              value: 'oui',
            },
          ],
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_reponse: 'logement' }],
      [{ id_kyc: 2, code_reponse: 'yi' }],
    ]);

    // THEN
    expect(result).toEqual(true);
  });
  it('isQuestionAnsweredByCode :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new KYCHistory();

    // THEN
    expect(questionsKYC.isQuestionAnsweredByCode('2')).toStrictEqual(false);
  });
  it('isMosaicAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new KYCHistory();

    // THEN
    expect(
      questionsKYC.isMosaicAnswered(KYCMosaicID.TEST_MOSAIC_ID),
    ).toStrictEqual(false);
  });

  it('hasResponses :false si attribut undefined', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
          reponse_complexe: undefined,
          reponse_simple: undefined,
        },
      ],
    });
    history.setCatalogue([new KycDefinition(KYC_DEF)]);

    // THEN
    expect(
      history
        .getUpToDateQuestionByCodeOrException(KYCID.KYC001)
        .hasAnyResponses(),
    ).toEqual(false);
  });
  it('hasResponses :false si attribut []', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
          reponse_complexe: [],
          reponse_simple: undefined,
        },
      ],
    });
    history.setCatalogue([new KycDefinition(KYC_DEF)]);

    // THEN
    expect(
      history
        .getUpToDateQuestionByCodeOrException(KYCID.KYC001)
        .hasAnyResponses(),
    ).toEqual(false);
  });
  it('hasResponses :true si au moins un reponse valorisée', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
          reponse_complexe: [
            {
              label: 'Yo',
              code: 'climat',
              ngc_code: '123',
              value: 'non',
            },
            {
              label: 'Yi',
              code: 'yi',
              ngc_code: '123',
              value: undefined,
            },
          ],
        },
      ],
    });
    history.setCatalogue([new KycDefinition(KYC_DEF)]);
    // THEN
    expect(
      history
        .getUpToDateQuestionByCodeOrException(KYCID.KYC001)
        .hasAnyResponses(),
    ).toEqual(true);
  });

  it('updateQuestion : exeption si question id inconnu', () => {
    // GIVEN
    const questionsKYC = new KYCHistory();

    // WHEN
    try {
      questionsKYC.updateQuestionByCodeWithLabelOrException('1234', ['yo']);
      fail();
    } catch (error) {
      // THEN
      expect(error.code).toEqual('030');
    }
  });

  it('getQuestionOrException : si code manquant dans catalogue, reponse disparait', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: 'a',
              ngc_code: '123',
              value: 'oui',
            },
            {
              label: 'truc',
              code: 'b',
              ngc_code: '456',
              value: 'non',
            },
          ],
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        reponses: [
          {
            code: 'a',
            label: 'yoyo',
            ngc_code: '0987',
          },
          {
            code: 'c',
            label: 'hihi',
            ngc_code: '000',
          },
        ],
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.getNombreReponsesPossibles()).toEqual(2);
    expect(question.getReponseComplexeByCode('a')).toEqual({
      code: 'a',
      emoji: undefined,
      image_url: undefined,
      label: 'yoyo',
      ngc_code: '0987',
      unite: undefined,
      value: 'oui',
    });
    expect(question.getReponseComplexeByCode('c')).toEqual({
      code: 'c',
      label: 'hihi',
      ngc_code: '000',
      value: undefined,
    });

    expect(history.answered_questions[0].getNombreReponsesPossibles()).toEqual(
      2,
    );
    expect(history.answered_questions[0].getReponseComplexeByCode('a')).toEqual(
      {
        code: 'a',
        emoji: undefined,
        image_url: undefined,
        label: 'yoyo',
        ngc_code: '0987',
        unite: undefined,
        value: 'oui',
      },
    );
    expect(history.answered_questions[0].getReponseComplexeByCode('c')).toEqual(
      {
        code: 'c',
        label: 'hihi',
        ngc_code: '000',
        value: undefined,
      },
    );
  });

  it('getQuestionOrException : si code manquant pas grave si question pas de type choix', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          type: TypeReponseQuestionKYC.entier,
          reponse_simple: { value: '123', unite: Unite.kg },
          reponse_complexe: [],
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        type: TypeReponseQuestionKYC.entier,
        reponses: [{ code: 'a', label: 'b', ngc_code: 'c' }],
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.getReponseSimple()).toEqual({ value: '123', unite: 'kg' });
  });

  it('getQuestionOrException : trouve une question répondu par id KYC CMS', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          code: KYCID.KYC001,
          id_cms: 1,
        },
      ],
    });

    // WHEN
    const question = history.getAnsweredQuestionByCMS_ID(1);

    // THEN
    expect(question.code).toEqual(KYCID.KYC001);
  });

  it('getKYCRestantes : kyc non repondu', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 1,
          code: KYCID.KYC001,
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        code: KYCID.KYC001,
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 2,
        code: KYCID.KYC002,
      }),
    ]);

    // WHEN
    const questions = history.getKYCsNeverAnswered(Categorie.recommandation);

    // THEN
    expect(questions).toHaveLength(1);
    expect(questions[0].code).toEqual(KYCID.KYC002);
  });

  it('getKYCRestantes : kyc non repondu et thematique', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 1,
          code: KYCID.KYC001,
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        thematique: Thematique.alimentation,
        code: KYCID.KYC001,
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 2,
        thematique: Thematique.logement,
        code: KYCID.KYC002,
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 3,
        thematique: Thematique.dechet,
        code: KYCID.KYC003,
      }),
    ]);

    // WHEN
    const questions = history.getKYCsNeverAnswered(
      Categorie.recommandation,
      Thematique.dechet,
    );

    // THEN
    expect(questions).toHaveLength(1);
    expect(questions[0].code).toEqual(KYCID.KYC003);
  });

  it('patchLogement : chauffage => maj KYC chauffage et vide l autre KYC reponse', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 2,
          categorie: Categorie.recommandation,
          code: KYCID.KYC_chauffage_elec,
          is_NGC: true,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponse_complexe: [
            { label: 'OUI', code: 'oui', ngc_code: '_oui', value: 'oui' },
          ],
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_bois,
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_elec,
        is_ngc: true,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 3,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_gaz,
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
      }),
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 4,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_fioul,
        is_ngc: true,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
      }),
    ]);

    // WHEN
    history.patchLogement({
      chauffage: Chauffage.bois,
    });

    // THEN
    expect(
      history.getAnsweredQuestionByCMS_ID(1).getNombreReponsesPossibles(),
    ).toEqual(3);
    expect(
      history.getAnsweredQuestionByCMS_ID(1).getReponseComplexeByCode('oui'),
    ).toEqual({
      label: 'OUI',
      code: 'oui',
      ngc_code: '_oui',
      value: 'oui',
    });
    expect(
      history.getAnsweredQuestionByCMS_ID(1).getReponseComplexeByCode('non'),
    ).toEqual({
      label: 'NON',
      code: 'non',
      ngc_code: '_non',
      value: 'non',
    });
    expect(
      history
        .getAnsweredQuestionByCMS_ID(1)
        .getReponseComplexeByCode('ne_sais_pas'),
    ).toEqual({
      label: 'Ne sais pas',
      code: 'ne_sais_pas',
      ngc_code: undefined,
      value: 'non',
    });
    expect(
      history.getAnsweredQuestionByCMS_ID(2).getNombreReponsesPossibles(),
    ).toEqual(3);
    expect(
      history.getAnsweredQuestionByCMS_ID(2).getReponseComplexeByCode('oui'),
    ).toEqual({
      code: 'oui',
      label: 'OUI',
      ngc_code: '_oui',
      value: 'non',
    });
    expect(
      history.getAnsweredQuestionByCMS_ID(2).getReponseComplexeByCode('non'),
    ).toEqual({
      code: 'non',
      label: 'NON',
      ngc_code: '_non',
      value: 'non',
    });
    expect(
      history
        .getAnsweredQuestionByCMS_ID(2)
        .getReponseComplexeByCode('ne_sais_pas'),
    ).toEqual({
      code: 'ne_sais_pas',
      label: 'Ne sais pas',
      ngc_code: undefined,
      value: 'oui',
    });
  });

  it('patchLogement :DPE', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });
    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_DPE,
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'A' },
          { label: 'B', code: 'B' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
      }),
    ]);

    // WHEN
    history.patchLogement({
      dpe: DPE.B,
    });

    // THEN
    expect(
      history
        .getAnsweredQuestionByCMS_ID(1)
        .getCodeReponseQuestionChoixUnique(),
    ).toEqual('B');
    expect(
      history.getAnsweredQuestionByCMS_ID(1).getReponseComplexeByCode('A'),
    ).toEqual({ label: 'A', code: 'A', ngc_code: undefined, value: 'non' });
    expect(
      history.getAnsweredQuestionByCMS_ID(1).getReponseComplexeByCode('B'),
    ).toEqual({ label: 'B', code: 'B', ngc_code: undefined, value: 'oui' });
    expect(
      history
        .getAnsweredQuestionByCMS_ID(1)
        .getReponseComplexeByCode('ne_sais_pas'),
    ).toEqual({
      label: 'Ne sais pas',
      code: 'ne_sais_pas',
      ngc_code: undefined,
      value: 'non',
    });
  });

  it('injectSituationNGC : ok si la situtation ne match rien', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    // WHEN
    history.injectSituationNGC(
      {
        'a . b': 123,
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(0);
  });

  it('injectSituationNGC : ok pour un kyc ngc de type entier et input entier', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': 123,
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(123);
  });

  it('injectSituationNGC : ok pour un kyc ngc de type entier et input entier as string', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        type: TypeReponseQuestionKYC.entier,
        is_ngc: true,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': '123',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(123);
  });

  it('injectSituationNGC : ok pour un kyc ngc de type decimal et input entier ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': '123',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(123);
  });

  it('injectSituationNGC : ok pour un kyc ngc de type decimal et input decimal ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': '123.34',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(123.34);
  });

  it('injectSituationNGC : ignore pour un kyc ngc de type entier et input pas entier ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': 'bad',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(0);
  });

  it('injectSituationNGC : ignore pour un kyc ngc de type decimal et input pas decimal ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': 'bad',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(0);
  });

  it('injectSituationNGC : ignore pour un kyc non ngc ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: false,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': '123',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(0);
  });

  it('injectSituationNGC : integre une reponse string pour une question a choix unique', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': 'toto . a',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getCodeReponseQuestionChoixUnique(),
    ).toEqual('a');
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('a'),
    ).toEqual({
      code: 'a',
      label: 'A',
      ngc_code: 'toto . a',
      value: 'oui',
    });
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('b'),
    ).toEqual({
      code: 'b',
      label: 'B',
      ngc_code: 'toto . b',
      value: 'non',
    });
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('ne_sais_pas'),
    ).toEqual({
      code: 'ne_sais_pas',
      label: 'Ne sais pas',
      ngc_code: null,
      value: 'non',
    });
  });

  it(`injectSituationNGC : maj d'une KYC deja renseignée`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 1,
          categorie: Categorie.recommandation,
          code: KYCID.KYC_chauffage,
          is_NGC: true,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponse_complexe: [
            {
              code: 'a',
              label: 'A',
              ngc_code: 'toto . a',
              value: 'oui',
            },
            {
              code: 'b',
              label: 'B',
              ngc_code: 'toto . b',
              value: 'non',
            },
            {
              code: 'ne_sais_pas',
              label: 'Ne sais pas',
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
      }),
    ]);

    // WHEN
    history.injectSituationNGC(
      {
        'a . b . c': 'toto . b',
      },
      utilisateur,
    );

    // THEN
    expect(history.answered_questions).toHaveLength(1);
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getCodeReponseQuestionChoixUnique(),
    ).toEqual('b');

    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('a'),
    ).toEqual({
      code: 'a',
      label: 'A',
      ngc_code: 'toto . a',
      value: 'non',
    });
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('b'),
    ).toEqual({
      code: 'b',
      label: 'B',
      ngc_code: 'toto . b',
      value: 'oui',
    });
    expect(
      history
        .getAnsweredQuestionByCode(KYCID.KYC_chauffage)
        .getReponseComplexeByCode('ne_sais_pas'),
    ).toEqual({
      code: 'ne_sais_pas',
      label: 'Ne sais pas',
      ngc_code: null,
      value: 'non',
    });
  });

  it(`isKYCEligible : true si condition ok`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 2,
          categorie: Categorie.recommandation,
          code: 'code_2',
          is_NGC: true,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponse_complexe: [
            {
              code: 'a',
              label: 'A',
              ngc_code: 'toto . a',
              value: 'oui',
            },
            {
              code: 'b',
              label: 'B',
              ngc_code: 'toto . b',
              value: 'non',
            },
            {
              code: 'ne_sais_pas',
              label: 'Ne sais pas',
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        conditions: [
          [
            {
              id_kyc: 2,
              code_reponse: 'a',
            },
          ],
        ],
      }),
      new KycDefinition({
        id_cms: 2,
        ...KYC_DEF,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(true);
  });

  it(`isKYCEligible : false si condition KO`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...QUESTION_TEST,
          id_cms: 2,
          categorie: Categorie.recommandation,
          code: 'code_2',
          is_NGC: true,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponse_complexe: [
            {
              code: 'a',
              label: 'A',
              ngc_code: 'toto . a',
              value: 'oui',
            },
            {
              code: 'b',
              label: 'B',
              ngc_code: 'toto . b',
              value: 'non',
            },
            {
              code: 'ne_sais_pas',
              label: 'Ne sais pas',
              ngc_code: null,
              value: 'non',
            },
          ],
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        conditions: [
          [
            {
              id_kyc: 2,
              code_reponse: 'b',
            },
          ],
        ],
      }),
      new KycDefinition({
        id_cms: 2,
        ...KYC_DEF,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(false);
  });

  it(`isKYCEligible : false si question par répondu KO`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        conditions: [
          [
            {
              id_kyc: 2,
              code_reponse: 'b',
            },
          ],
        ],
      }),
      new KycDefinition({
        id_cms: 2,
        ...KYC_DEF,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(false);
  });

  it(`isKYCEligible : true si aucune condition `, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        ...KYC_DEF,
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        type: TypeReponseQuestionKYC.entier,
        conditions: [],
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(true);
  });
});
