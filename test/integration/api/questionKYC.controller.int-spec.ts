import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  CategorieQuestionKYC,
  QuestionID,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import { DB, TestUtil } from '../../TestUtil';
import { CatalogueQuestionsKYC } from '../../../src/domain/kyc/catalogueQuestionsKYC';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';

describe('/utilisateurs/id/questionsKYC (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    CatalogueQuestionsKYC.resetCatalogue();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/questionsKYC - liste N questions', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(
      CatalogueQuestionsKYC.getTailleCatalogue(),
    );
  });
  it('GET /utilisateurs/id/questionsKYC - liste N questions dont une remplie', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(
      CatalogueQuestionsKYC.getTailleCatalogue(),
    );
    const quest = response.body.find((e) => e.id === '_2');
    expect(quest.reponse).toStrictEqual(['Le climat', 'Mon logement']);
  });
  it('GET /utilisateurs/id/questionsKYC/3 - renvoie la question sans réponse', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/_3',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.default);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
    expect(response.body.reponse).toEqual([]);
  });
  it(`GET /utilisateurs/id/questionsKYC/3 - renvoie les reponses possibles du catalogue, pas de la question historique `, async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: QuestionID.KYC001,
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.default,
        points: 10,
        reponses: [],
        reponses_possibles: [
          { label: 'AAA', code: Thematique.climat },
          { label: 'BBB', code: Thematique.logement },
        ],
        tags: [],
      },
    ]);
    await TestUtil.create(DB.utilisateur, {
      kyc: {
        version: 0,
        answered_questions: [
          {
            id: QuestionID.KYC001,
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
          },
        ],
      },
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.reponses_possibles).toEqual(['AAA', 'BBB']);
    expect(response.body.reponse).toEqual(['AAA']);
  });
  it('GET /utilisateurs/id/questionsKYC/bad - renvoie 404', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/id/questionsKYC/question - renvoie la quesition avec la réponse', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      kyc: {
        version: 0,
        answered_questions: [
          {
            id: QuestionID._2,
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
              { label: 'Ce que je mange', code: Thematique.alimentation },
            ],
            tags: [],
          },
        ],
      },
    });
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: QuestionID._2,
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.default,
        points: 10,
        reponses_possibles: [
          { label: 'Le climat', code: Thematique.climat },
          { label: 'Mon logement', code: Thematique.logement },
          { label: 'Ce que je mange', code: Thematique.alimentation },
        ],
        tags: [],
      },
    ]);
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual(
      `Quel est votre sujet principal d'intéret ?`,
    );
    expect(response.body.reponse).toEqual(['Le climat', 'Mon logement']);
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - crée la reponse à la question 1, empoche les points', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    expect(
      user.kyc_history.getQuestionOrException('_1').reponses,
    ).toStrictEqual([
      {
        code: null,
        label: 'YO',
      },
    ]);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(20);
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    expect(
      user.kyc_history.getQuestionOrException('_2').reponses,
    ).toStrictEqual([
      {
        code: Thematique.climat,
        label: 'Le climat',
      },
    ]);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(10);
  });
  it('PUT /utilisateurs/id/questionsKYC/001 - met à jour les tags de reco - ajout boost', async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: QuestionID.KYC001,
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
      },
    ]);

    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Comment je bouge'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.transport).toEqual(50);
  });
  it('PUT /utilisateurs/id/questionsKYC/KYC001 - met à jour les tags de reco - suppression boost', async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: QuestionID.KYC001,
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
      },
    ]);

    await TestUtil.create(DB.utilisateur);

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/KYC001').send(
      {
        reponse: ['Comment je bouge'],
      },
    );

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.transport).toEqual(0);
  });
  it('PUT /utilisateurs/id/questionsKYC/001 - transpose l ancien code 001', async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: QuestionID.KYC001,
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
      },
    ]);

    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/001',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(
      userDB.kyc_history
        .getQuestion(QuestionID.KYC001)
        .includesReponseCode(Thematique.climat),
    ).toEqual(true);
  });
  it('PUT /utilisateurs/id/questionsKYC/006 - transpose dans logement KYC006 plus de 15 ans', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      logement: {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '91120',
        chauffage: Chauffage.bois,
        commune: 'PALAISEAU',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: false,
        proprietaire: true,
      },
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC006',
    ).send({ reponse: ['plus_15'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });
  it('PUT /utilisateurs/id/questionsKYC/bad - erreur 404 ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    ).send({ reponse: ['YO'] });

    // THEN

    expect(response.status).toBe(404);
  });
});
