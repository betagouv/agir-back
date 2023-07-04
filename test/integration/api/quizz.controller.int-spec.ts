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
    await TestUtil.prisma.quizz.create({
      data: { id: '1', titre: 'The Quizz !' },
    });
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {
          id: '1',
          libelle: 'question1',
          solution: '10',
          propositions: ['1', '5', '10'],
          quizzId: '1',
        },
        {
          id: '2',
          libelle: 'question2',
          solution: '1',
          propositions: ['1', '2'],
          quizzId: '1',
        },
      ],
    });
    const response = await TestUtil.getServer().get('/quizz/1');
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('The Quizz !');
    expect(response.body['questions']).toHaveLength(2);
  });

  it('POST /quizz/id/evaluer - compute a success quizz result', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: 'userId', name: 'bob' },
    });
    await TestUtil.prisma.dashboard.create({
      data: { id: '123', utilisateurId: 'userId', todoQuizz: ['1'] },
    });

    await TestUtil.prisma.quizz.create({
      data: { id: '1', titre: 'The Quizz !' },
    });
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {
          id: '1',
          libelle: 'question1',
          solution: '10',
          propositions: ['1', '5', '10'],
          quizzId: '1',
        },
        {
          id: '2',
          libelle: 'question2',
          solution: '1',
          propositions: ['1', '2'],
          quizzId: '1',
        },
      ],
    });
    const response = await TestUtil.getServer()
      .post('/quizz/1/evaluer')
      .send({
        utilisateur: 'userId',
        reponses: [{ '1': '10' }, { '2': '1' }],
      });
    expect(response.status).toBe(200);
    expect(response.body.resultat).toEqual(true);

    const dashboard = await TestUtil.prisma.dashboard.findUnique({
      where: { id: '123' },
      include: { badges: true },
    });
    expect(dashboard.todoQuizz).toHaveLength(0);
    expect(dashboard.doneQuizz).toHaveLength(1);
    expect(dashboard['badges']).toHaveLength(1);
  });
  it('POST /quizz/id/evaluer - compute a fail quizz result', async () => {
    await TestUtil.prisma.quizz.create({
      data: { id: '1', titre: 'The Quizz !' },
    });
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {
          id: '1',
          libelle: 'question1',
          solution: '10',
          propositions: ['1', '5', '10'],
          quizzId: '1',
        },
        {
          id: '2',
          libelle: 'question2',
          solution: '1',
          propositions: ['1', '2'],
          quizzId: '1',
        },
      ],
    });
    const response = await TestUtil.getServer()
      .post('/quizz/1/evaluer')
      .send({
        utilisateur: 'Dorian',
        reponses: [{ '1': '10' }, { '2': 'bad' }],
      });
    expect(response.status).toBe(200);
    expect(response.body.resultat).toEqual(false);
  });
});
