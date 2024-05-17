import { TestUtil } from '../../TestUtil';
import { QuizStatistiqueRepository } from '../../../src/infrastructure/repository/quizStatistique.repository';

describe('QuizStatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const quizStatistiqueRepository = new QuizStatistiqueRepository(
    TestUtil.prisma,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it("upsertStatistiquesDUnQuiz  : créer ou modifie les statistiques d'un quiz", async () => {
    // WHEN
    await quizStatistiqueRepository.upsertStatistiquesDUnQuiz(
      'quiz-id-1',
      'Titre quiz 1',
      3,
      2,
    );
    await quizStatistiqueRepository.upsertStatistiquesDUnQuiz(
      'quiz-id-2',
      'Titre quiz 2',
      5,
      2,
    );

    // THEN
    const quiz1 = await TestUtil.prisma.quizStatistique.findUnique({
      where: { quizId: 'quiz-id-1' },
    });
    const quiz2 = await TestUtil.prisma.quizStatistique.findUnique({
      where: { quizId: 'quiz-id-2' },
    });

    expect(quiz1.nombre_de_bonne_reponse).toEqual(3);
    expect(quiz1.nombre_de_mauvaise_reponse).toEqual(2);
    expect(quiz1.titre).toEqual('Titre quiz 1');
    expect(quiz2.nombre_de_bonne_reponse).toEqual(5);
    expect(quiz2.nombre_de_mauvaise_reponse).toEqual(2);
    expect(quiz2.titre).toEqual('Titre quiz 2');
  });
});
