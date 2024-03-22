import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  CategorieQuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import { DB, TestUtil } from '../../TestUtil';
import { CatalogueQuestionsKYC } from '../../../src/domain/kyc/catalogueQuestionsKYC';
import { Thematique } from '../../../src/domain/contenu/thematique';

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
    const quest = response.body.find((e) => e.id === '2');
    expect(quest.reponse).toStrictEqual(['Le climat', 'Mon logement']);
  });
  it('GET /utilisateurs/id/questionsKYC/3 - renvoie la question sans réponse', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/3',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.service);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
    expect(response.body.reponse).toEqual([]);
  });
  it(`GET /utilisateurs/id/questionsKYC/3 - renvoie les reponses possibles du catalogue, pas de la question historique `, async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: '001',
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.service,
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
            id: '001',
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: CategorieQuestionKYC.service,
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
      '/utilisateurs/utilisateur-id/questionsKYC/001',
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
            id: '2',
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: CategorieQuestionKYC.service,
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
        id: '2',
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.service,
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
      '/utilisateurs/utilisateur-id/questionsKYC/2',
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
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    expect(user.kyc_history.getQuestionOrException('1').reponses).toStrictEqual(
      [
        {
          code: null,
          label: 'YO',
        },
      ],
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(20);
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/2',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    expect(user.kyc_history.getQuestionOrException('2').reponses).toStrictEqual(
      [
        {
          code: Thematique.climat,
          label: 'Le climat',
        },
      ],
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(10);
  });
  it('PUT /utilisateurs/id/questionsKYC/001 - met à jour les tags de reco - ajout boost', async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: '001',
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.service,
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
    ).send({ reponse: ['Comment je bouge'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.interet_transports).toEqual(50);
  });
  it('PUT /utilisateurs/id/questionsKYC/001 - met à jour les tags de reco - suppression boost', async () => {
    // GIVEN
    CatalogueQuestionsKYC.setCatalogue([
      {
        id: '001',
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        is_NGC: false,
        categorie: CategorieQuestionKYC.service,
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

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/001').send({
      reponse: ['Comment je bouge'],
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/001',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.interet_transports).toEqual(0);
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
