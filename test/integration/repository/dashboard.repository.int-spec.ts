import { TestUtil } from '../../TestUtil';
import {DashboardRepository} from '../../../src/infrastructure/repository/dashboard.repository';

describe('DashboardRepository', () => {
  let dashboardRepository = new DashboardRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('updates todo quizz list OK', async () => {
    await TestUtil.prisma.utilisateur.create({ data: { id: '1', name: "bob" }});
    const dashboard = await TestUtil.prisma.dashboard.create({ data: {id : "123", utilisateurId: "1", todoQuizz:["1234", "5678"]}});
    dashboard.todoQuizz = ["1", "2"];
    dashboard.doneQuizz = ["done"];
    
    await dashboardRepository.updateQuizzArrays(dashboard);

    const result = await TestUtil.prisma.dashboard.findUnique({where: {id: "123"}})
    expect(result.todoQuizz).toContain("1");
    expect(result.todoQuizz).toContain("2");
    expect(result.doneQuizz).toContain("done");
  });

});
