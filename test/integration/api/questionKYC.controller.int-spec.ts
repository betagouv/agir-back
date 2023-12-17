import { QuestionKYCRepository } from '../../../src/infrastructure/repository/questionKYC.repository';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/questionsKYC (API test)', () => {
  const questionRepo = new QuestionKYCRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/questionsKYC - liste 3 reponses', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });
  it('GET /utilisateurs/id/questionsKYC - liste 3 reponses dont une remplie', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].reponse).toBe('all good');
  });
  it('GET /utilisateurs/id/questionsKYC/1 - renvoie la question sans réponse', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.question).toEqual(
      'Comment avez vous connu le service ?',
    );
    expect(response.body.reponse).toEqual(null);
  });
  it('GET /utilisateurs/id/questionsKYC/bad - renvoie 404', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/id/questionsKYC/question - renvoie la quesition avec la réponse', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual('whats up ?');
    expect(response.body.reponse).toEqual('all good');
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - crée la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: 'YO' });

    // THEN
    expect(response.status).toBe(200);
    const collection = await questionRepo.getAll('utilisateur-id');
    expect(collection.getQuestion('1').reponse).toBe('YO');
    expect(collection.getQuestion('1').question).toBe(
      'Comment avez vous connu le service ?',
    );
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: 'YO' });

    // THEN
    expect(response.status).toBe(200);
    const collection = await questionRepo.getAll('utilisateur-id');
    expect(collection.getQuestion('1').reponse).toBe('YO');
  });
  it('PUT /utilisateurs/id/questionsKYC/bad - erreur 404 ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/BD',
    ).send({ reponse: 'YO' });

    // THEN

    expect(response.status).toBe(404);
  });
});
