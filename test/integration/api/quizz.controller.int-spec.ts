import { TestUtil } from '../../TestUtil';

describe('/Quizz (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /quizz/id - get a quizz content by id', async () => {
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: 'quizzQuestion-id2' });
    const response = await TestUtil.getServer().get('/quizz/quizz-id');
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('titre');
    expect(response.body['questions']).toHaveLength(2);
    expect(response.body['questions'][0].solution).toBeDefined();
    expect(response.body['questions'][0].texte_riche_explication).toBeDefined();
  });

  it('POST /quizz/id/evaluer - compute a success quizz result', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: 'quizzQuestion-id2' });
    const response = await TestUtil.getServer()
      .post('/quizz/quizz-id/evaluer')
      .send({
        utilisateur: 'utilisateur-id',
        reponses: [{ 'quizzQuestion-id': '10' }, { 'quizzQuestion-id2': '10' }],
      });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.resultat).toEqual(true);

    const utilisateurDb = TestUtil.prisma.utilisateur.findUnique({
      where: {
        id: 'utilisateur-id',
      },
    });

    expect(utilisateurDb['badges']).toHaveLength(1);
  });
  it('POST /quizz/id/evaluer - compute a fail quizz result', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: 'quizzQuestion-id2' });
    const response = await TestUtil.getServer()
      .post('/quizz/quizz-id/evaluer')
      .send({
        utilisateur: 'utilisateur-id',
        reponses: [
          { 'quizzQuestion-id': '10' },
          { 'quizzQuestion-id2': 'bad' },
        ],
      });
    expect(response.status).toBe(200);
    expect(response.body.resultat).toEqual(false);
  });
});
