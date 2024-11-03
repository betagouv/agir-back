import { Thematique } from '../../../../src/domain/contenu/thematique';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../src/domain/kyc/questionKYC';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { Univers } from '../../../../src/domain/univers/univers';
import { Tag } from '../../../../src/domain/scoring/tag';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KycDefinition } from '../../../../src/domain/kyc/kycDefinition';
import { Chauffage, DPE } from '../../../../src/domain/logement/logement';
import { KYCMosaicID } from '../../../../src/domain/kyc/KYCMosaicID';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('areConditionsMatched : true si pas de condition', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `question`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          id_cms: 1,
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si kyc par répondu', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si match simple', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_kyc: 'KYC001', code_reponse: 'climat' }],
    ]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si non match simple', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_kyc: 'KYC001', code_reponse: 'logement' }],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si match 2 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          id: KYCID.KYC002,
          id_cms: 2,
          question: `question 2`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'YO', code: 'yo' }],
          reponses_possibles: [
            { label: 'YO', code: 'yo' },
            { label: 'YA', code: 'ya' },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [
        { id_kyc: 1, code_kyc: 'KYC001', code_reponse: 'climat' },
        { id_kyc: 2, code_kyc: 'KYC002', code_reponse: 'yo' },
      ],
    ]);

    // THEN
    expect(result).toEqual(true);
  });
  it('areConditionsMatched : false si non match 2 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          id: KYCID.KYC002,
          id_cms: 2,
          question: `question 2`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'YO', code: 'yo' }],
          reponses_possibles: [
            { label: 'YO', code: 'yo' },
            { label: 'YA', code: 'ya' },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [
        { id_kyc: 1, code_kyc: 'KYC001', code_reponse: 'logement' },
        { id_kyc: 2, code_kyc: 'KYC002', code_reponse: 'ya' },
      ],
    ]);

    // THEN
    expect(result).toEqual(false);
  });
  it('areConditionsMatched : true si OU match 1 conditions OK', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `question 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          id: KYCID.KYC002,
          id_cms: 2,
          question: `question 2`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'YO', code: 'yo' }],
          reponses_possibles: [
            { label: 'YO', code: 'yo' },
            { label: 'YA', code: 'ya' },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const result = history.areConditionsMatched([
      [{ id_kyc: 1, code_kyc: 'KYC001', code_reponse: 'logement' }],
      [{ id_kyc: 2, code_kyc: 'KYC002', code_reponse: 'yo' }],
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: undefined,
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

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
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'Le climat', code: Thematique.climat },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);
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
  it('getQuestionOrException : rematch la reponse via code sur catalogue', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: '🥦 Alimentation', code: Thematique.alimentation },
          { label: '☀️ Climat et Environnement', code: Thematique.climat },
          { label: '🛒 Consommation durable', code: Thematique.consommation },
          { label: '🗑️ Déchets', code: Thematique.dechet },
          { label: '🏡 Logement', code: Thematique.logement },
          {
            label: '⚽ Loisirs (vacances, sport,...)',
            code: Thematique.loisir,
          },
          { label: '🚗 Transports', code: Thematique.transport },
          { label: 'Aucun / Je ne sais pas', code: 'rien' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.reponses[0].code).toEqual(Thematique.climat);
    expect(question.reponses[0].label).toEqual('☀️ Climat et Environnement');
    expect(question.reponses_possibles).toEqual([
      { label: '🥦 Alimentation', code: Thematique.alimentation },
      { label: '☀️ Climat et Environnement', code: Thematique.climat },
      { label: '🛒 Consommation durable', code: Thematique.consommation },
      { label: '🗑️ Déchets', code: Thematique.dechet },
      { label: '🏡 Logement', code: Thematique.logement },
      {
        label: '⚽ Loisirs (vacances, sport,...)',
        code: Thematique.loisir,
      },
      { label: '🚗 Transports', code: Thematique.transport },
      { label: 'Aucun / Je ne sais pas', code: 'rien' },
    ]);
  });
  it('getQuestionOrException : si code manquant dans catalogue, reponse disparait', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.reponses).toEqual([
      {
        label: 'BBB',
        code: Thematique.logement,
      },
    ]);
    expect(question.reponses_possibles).toEqual([
      { label: 'BBB', code: Thematique.logement },
      { label: 'CCC', code: Thematique.alimentation },
    ]);

    expect(history.answered_questions[0].reponses).toEqual([
      {
        label: 'BBB',
        code: Thematique.logement,
      },
    ]);
  });
  it('getQuestionOrException : si code manquant dans catalogue, reponse disparait', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.reponses).toEqual([
      {
        label: 'BBB',
        code: Thematique.logement,
      },
    ]);
    expect(question.reponses_possibles).toEqual([
      { label: 'BBB', code: Thematique.logement },
      { label: 'CCC', code: Thematique.alimentation },
    ]);

    expect(history.answered_questions[0].reponses).toEqual([
      {
        label: 'BBB',
        code: Thematique.logement,
      },
    ]);
  });
  it('getQuestionOrException : si code manquant pas grave si question pas de type choix', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: '123', code: null }],
          reponses_possibles: [],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        ngc_key: 'a . b . c',
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const question = history.getUpToDateQuestionByCodeOrException(KYCID.KYC001);

    // THEN
    expect(question.reponses).toEqual([{ label: '123', code: null }]);
  });

  it('getQuestionOrException : trouve une question répondu par id KYC CMS', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: '123', code: null }],
          reponses_possibles: [],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    // WHEN
    const question = history.getAnsweredQuestionByCMS_ID(1);

    // THEN
    expect(question.id).toEqual(KYCID.KYC001);
  });

  it('getKYCRestantes : kyc non repondu', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.test,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        ngc_key: 'a . b . c',
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.test,
        code: KYCID.KYC002,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        ngc_key: 'a . b . c',
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.libre,
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const questions = history.getKYCRestantes(Categorie.test);

    // THEN
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toEqual(KYCID.KYC002);
  });
  it('getKYCRestantes : filtrage univers', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
            { label: 'Comment je bouge', code: Thematique.transport },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: KYCID.KYC002,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.climat],
        thematique: Thematique.climat,
        ngc_key: 'a . b . c',
        type: TypeReponseQuestionKYC.libre,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    const questions = history.getKYCRestantes(
      Categorie.test,
      Univers.consommation,
    );

    // THEN
    expect(questions).toHaveLength(0);
  });

  it('patchLogement : chauffage => maj KYC chauffage et vide l autre KYC reponse', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id_cms: 2,
          categorie: Categorie.recommandation,
          id: KYCID.KYC_chauffage_elec,
          is_NGC: true,
          a_supprimer: false,
          points: 10,
          question: 'The question !',
          tags: [],
          universes: [],
          thematique: Thematique.climat,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponses: [{ label: 'OUI', code: 'oui', ngc_code: '_oui' }],
          reponses_possibles: [
            { label: 'OUI', code: 'oui', ngc_code: '_oui' },
            { label: 'NON', code: 'non', ngc_code: '_non' },
            { label: 'Ne sais pas', code: 'ne_sais_pas' },
          ],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_bois,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_elec,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 3,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_gaz,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 4,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage_fioul,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'OUI', code: 'oui', ngc_code: '_oui' },
          { label: 'NON', code: 'non', ngc_code: '_non' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    history.patchLogement({
      chauffage: Chauffage.bois,
    });

    // THEN
    expect(history.getAnsweredQuestionByCMS_ID(1).reponses[0]).toEqual({
      code: 'oui',
      label: 'OUI',
      ngc_code: '_oui',
    });
    expect(history.getAnsweredQuestionByCMS_ID(2).reponses[0]).toEqual({
      label: 'Ne sais pas',
      code: 'ne_sais_pas',
      ngc_code: undefined,
    });
  });

  it('patchLogement :DPE', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });
    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_DPE,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a' },
          { label: 'B', code: 'b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas' },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);

    // WHEN
    history.patchLogement({
      dpe: DPE.B,
    });

    // THEN
    expect(history.getAnsweredQuestionByCMS_ID(1).reponses[0]).toEqual({
      code: 'b',
      label: 'B',
      ngc_code: undefined,
    });
  });

  it('injectSituationNGC : ok si la situtation ne match rien', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
        .listeReponsesLabels()[0],
    ).toEqual('123');
  });
  it('injectSituationNGC : ok pour un kyc ngc de type entier et input entier', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
        .listeReponsesLabels()[0],
    ).toEqual('123');
  });
  it('injectSituationNGC : ok pour un kyc ngc de type entier et input entier as string', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
        .listeReponsesLabels()[0],
    ).toEqual('123');
  });
  it('injectSituationNGC : ok pour un kyc ngc de type decimal et input entier ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
        .listeReponsesLabels()[0],
    ).toEqual('123');
  });
  it('injectSituationNGC : ok pour un kyc ngc de type decimal et input decimal ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
        .listeReponsesLabels()[0],
    ).toEqual('123.34');
  });
  it('injectSituationNGC : ignore pour un kyc ngc de type entier et input pas entier ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
  it('injectSituationNGC : ignore pour un kyc ngc de type entier et input pas entier ', () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.decimal,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: false,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        ngc_key: 'a . b . c',
        reponses: [],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      history.getAnsweredQuestionByCode(KYCID.KYC_chauffage).reponses,
    ).toEqual([{ code: 'a', label: 'A', ngc_code: 'toto . a' }]);
  });
  it(`injectSituationNGC : maj d'une KYC deja renseignée`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur('yo', false, null);
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id_cms: 1,
          categorie: Categorie.recommandation,
          id: KYCID.KYC_chauffage,
          is_NGC: true,
          a_supprimer: false,
          points: 10,
          question: 'The question !',
          tags: [],
          universes: [],
          thematique: Thematique.climat,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          reponses: [{ label: 'A1', code: 'a', ngc_code: 'toto . a' }],
          reponses_possibles: [
            { label: 'A', code: 'a', ngc_code: 'toto . a' },
            { label: 'B', code: 'b', ngc_code: 'toto . b' },
            { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
          ],
          short_question: 'short',
          image_url: 'https://',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
      history.getAnsweredQuestionByCode(KYCID.KYC_chauffage).reponses,
    ).toEqual([{ code: 'b', label: 'B', ngc_code: 'toto . b' }]);
  });
  it(`isKYCEligible : true si condition ok`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id_cms: 2,
          categorie: Categorie.recommandation,
          id: 'code_2',
          is_NGC: true,
          a_supprimer: false,
          points: 10,
          question: 'The question !',
          tags: [],
          universes: [],
          thematique: Thematique.climat,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          short_question: 'short',
          image_url: 'https://',
          reponses: [{ label: 'A', code: 'haha', ngc_code: 'toto . a' }],
          reponses_possibles: [
            { label: 'A', code: 'haha', ngc_code: 'toto . a' },
            { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
            { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
          ],
          unite: Unite.kg,
          emoji: '🔥',
          conditions: [
            [
              {
                id_kyc: 2,
                code_kyc: 'code_2',
                code_reponse: 'haha',
              },
            ],
          ],
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [
          [
            {
              id_kyc: 2,
              code_kyc: 'code_2',
              code_reponse: 'haha',
            },
          ],
        ],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question 2',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(true);
  });
  it(`isKYCEligible : false si condition ko`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id_cms: 2,
          categorie: Categorie.recommandation,
          id: 'code_2',
          is_NGC: true,
          a_supprimer: false,
          points: 10,
          question: 'The question !',
          tags: [],
          universes: [],
          thematique: Thematique.climat,
          type: TypeReponseQuestionKYC.choix_unique,
          ngc_key: 'a . b . c',
          short_question: 'short',
          image_url: 'https://',
          reponses: [{ label: 'B', code: 'hihi', ngc_code: 'toto . b' }],
          reponses_possibles: [
            { label: 'A', code: 'haha', ngc_code: 'toto . a' },
            { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
            { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
          ],
          conditions: [
            [
              {
                id_kyc: 2,
                code_kyc: 'code_2',
                code_reponse: 'haha',
              },
            ],
          ],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [
          [
            {
              id_kyc: 2,
              code_kyc: 'code_2',
              code_reponse: 'haha',
            },
          ],
        ],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question 2',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(false);
  });
  it(`isKYCEligible : false si question par répondues`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [
          [
            {
              id_kyc: 2,
              code_kyc: 'code_2',
              code_reponse: 'haha',
            },
          ],
        ],
        unite: Unite.kg,
        emoji: '🔥',
      }),
      new KycDefinition({
        id_cms: 2,
        categorie: Categorie.recommandation,
        code: 'code_2',
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question 2',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'haha', ngc_code: 'toto . a' },
          { label: 'B', code: 'hihi', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
      }),
    ]);
    // WHEN
    const reponse = history.isKYCEligible(
      history.getUpToDateQuestionByCodeOrNull(KYCID.KYC_chauffage),
    );

    // THEN
    expect(reponse).toEqual(false);
  });
  it(`isKYCEligible : true si aucune condition`, () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    });

    history.setCatalogue([
      new KycDefinition({
        id_cms: 1,
        categorie: Categorie.recommandation,
        code: KYCID.KYC_chauffage,
        is_ngc: true,
        a_supprimer: false,
        points: 10,
        question: 'The question !',
        tags: [],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_unique,
        ngc_key: 'a . b . c',
        reponses: [
          { label: 'A', code: 'a', ngc_code: 'toto . a' },
          { label: 'B', code: 'b', ngc_code: 'toto . b' },
          { label: 'Ne sais pas', code: 'ne_sais_pas', ngc_code: null },
        ],
        short_question: 'short',
        image_url: 'https://',
        conditions: [],
        unite: Unite.kg,
        emoji: '🔥',
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
