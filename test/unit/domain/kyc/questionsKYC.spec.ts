import { Thematique } from '../../../../src/domain/contenu/thematique';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
  KYCID,
} from '../../../../src/domain/kyc/questionQYC';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { Univers } from '../../../../src/domain/univers/univers';
import { Tag } from '../../../../src/domain/scoring/tag';

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('isQuestionAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new KYCHistory();

    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(false);
  });
  it('isQuestionAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new KYCHistory();

    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(false);
  });
  it('hasResponses :false si attribut undefined', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
      },
    ]);

    // THEN
    expect(history.getQuestionOrException(KYCID.KYC001).hasResponses()).toEqual(
      false,
    );
  });
  it('hasResponses :false si attribut []', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
      },
    ]);
    // THEN
    expect(history.getQuestionOrException(KYCID.KYC001).hasResponses()).toEqual(
      false,
    );
  });
  it('hasResponses :true si au moins un reponse valorisée', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'Le climat', code: Thematique.climat },
        ],
      },
    ]);
    // THEN
    expect(history.getQuestionOrException(KYCID.KYC001).hasResponses()).toEqual(
      true,
    );
  });
  it('updateQuestion : exeption si question id inconnu', () => {
    // GIVEN
    const questionsKYC = new KYCHistory();

    // WHEN
    try {
      questionsKYC.updateQuestion('1234', ['yo']);
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
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
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
      },
    ]);

    // WHEN
    const question = history.getQuestionOrException(KYCID.KYC001);

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
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
      },
    ]);

    // WHEN
    const question = history.getQuestionOrException(KYCID.KYC001);

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
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
        ],
      },
    ]);

    // WHEN
    const question = history.getQuestionOrException(KYCID.KYC001);

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
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
          points: 10,
          reponses: [{ label: '123', code: null }],
          reponses_possibles: [],
          tags: [],
          universes: [],
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.entier,
        reponses: [],
      },
    ]);

    // WHEN
    const question = history.getQuestionOrException(KYCID.KYC001);

    // THEN
    expect(question.reponses).toEqual([{ label: '123', code: null }]);
  });

  it('getKYCRestantes : kyc non repondu', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.default,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
      },
      {
        id_cms: 2,
        categorie: CategorieQuestionKYC.default,
        code: KYCID.KYC002,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.alimentation],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.libre,
        reponses: [],
      },
    ]);

    // WHEN
    const questions = history.getKYCRestantes(CategorieQuestionKYC.default);

    // THEN
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toEqual(KYCID.KYC002);
  });
  it('getKYCRestantes : filtrage univers', () => {
    // GIVEN
    const history = new KYCHistory({
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: CategorieQuestionKYC.default,
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
        },
      ],
    });
    history.setCatalogue([
      {
        id_cms: 1,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC001,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
      },
      {
        id_cms: 2,
        categorie: CategorieQuestionKYC.recommandation,
        code: KYCID.KYC002,
        is_ngc: false,
        points: 10,
        question: 'The question !',
        tags: [Tag.possede_voiture],
        universes: [Univers.climat],
        thematique: Thematique.climat,
        type: TypeReponseQuestionKYC.libre,
        reponses: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
          { label: 'CCC', code: Thematique.alimentation },
          { label: 'DDD', code: Thematique.transport },
        ],
      },
    ]);

    // WHEN
    const questions = history.getKYCRestantes(
      CategorieQuestionKYC.default,
      Univers.consommation,
    );

    // THEN
    expect(questions).toHaveLength(0);
  });
});
