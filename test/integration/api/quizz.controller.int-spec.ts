import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/Quizz (API test)', () => {

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('POST /quizz/id/evaluer - compute a success quizz result', async () => {
    await TestUtil.prisma.quizz.create({
        data: {id: "1", titre: "The Quizz !"}
      })
      await TestUtil.prisma.quizzQuestion.createMany({
        data: [
          {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
          {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
        ]
      });
      const response = await request(TestUtil.app.getHttpServer()).post('/quizz/1/evaluer').send(
        {
            utilisateur: 'Dorian',
            reponses: [
                {"1":"10"},
                {"2":"1"}
            ] 
        });
        expect(response.status).toBe(200);
        expect(response.body.resultat).toEqual(true);
    });
    it('POST /quizz/id/evaluer - compute a fail quizz result', async () => {
        await TestUtil.prisma.quizz.create({
            data: {id: "1", titre: "The Quizz !"}
          })
          await TestUtil.prisma.quizzQuestion.createMany({
            data: [
              {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
              {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
            ]
          });
          const response = await request(TestUtil.app.getHttpServer()).post('/quizz/1/evaluer').send(
            {
                utilisateur: 'Dorian',
                reponses: [
                    {"1":"10"},
                    {"2":"bad"}
                ] 
            });
            expect(response.status).toBe(200);
            expect(response.body.resultat).toEqual(false);
        });
    });
