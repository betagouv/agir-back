import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/dashboard (API test)', () => {

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('GET /dashboards/name - get a dashboard by name with proper compteurs, badges, quizz', async () => {
    await TestUtil.prisma.utilisateur.create({ data: { id: '1', name: "bob" }});

    await TestUtil.prisma.quizz.create({
      data: {id: "quizzID", titre: "The Quizz !"}
    });
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "quizzID"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "quizzID"}
      ]
    });

    await TestUtil.prisma.dashboard.create({ data: {id : "123", utilisateurId: "1", todoQuizz: ["quizzID"]}});

    await TestUtil.prisma.compteur.create({ data: {id : "1", titre: "t1",valeur: "1", dashboardId: "123"}});
    await TestUtil.prisma.compteur.create({ data: {id : "2", titre: "t2",valeur: "99", dashboardId: "123"}});

    await TestUtil.prisma.badge.create({ data: {id : "1", titre: "badge",date: new Date(), dashboardId: "123"}});


    const response = await request(TestUtil.app.getHttpServer()).get('/dashboards/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toHaveLength(2)
    expect(response.body.badges).toHaveLength(1)
    expect(response.body.quizz).toHaveLength(1)
  });


});
