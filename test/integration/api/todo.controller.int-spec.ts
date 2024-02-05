import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { TestUtil } from '../../TestUtil';
import { LiveService } from '../../../src/domain/service/serviceDefinition';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { EventType } from '../../../src/domain/utilisateur/utilisateurEvent';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';

describe('TODO list (API test)', () => {
  const OLD_ENV = process.env;
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/todo retourne la todo liste courante seule', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.points_todo).toEqual(30);
    expect(response.body.titre).toEqual(`Votre 1ère mission`);
    expect(response.body.todo[0].id.length).toBeGreaterThan(12);
    expect(response.body.todo[0].titre).toEqual(
      'Réussir 1 quiz Climat - très facile',
    );
    expect(response.body.todo[0].progression).toEqual({
      current: 0,
      target: 1,
    });
    expect(response.body.is_last).toEqual(false);
    expect(response.body.todo[0].sont_points_en_poche).toEqual(false);
    expect(response.body.todo[0].type).toEqual('quizz');
    expect(response.body.todo[0].points).toEqual(20);
    expect(response.body.todo[0].thematiques).toEqual(['climat']);
  });
  it('GET /utilisateurs/id/todo retourne la todo avec le champ aide et done_at, ainsi que todo_end = false', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done_at: new Date(),
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'aide',
                url: '/aides',
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(new Date(response.body.done_at).getTime()).toBeGreaterThan(
      Date.now() - 150,
    );
    expect(response.body.todo[0].url).toEqual('/aides');
    expect(response.body.is_last).toEqual(false);
  });
  it('GET /utilisateurs/id/todo retourne la TODO de terminaison + is_last = true', async () => {
    // GIVEN
    const todo = new ParcoursTodo();
    todo.todo_active = 5;
    await TestUtil.create('utilisateur', {
      todo: todo,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('Plus de mission, pour le moment...');
    expect(response.body.is_last).toEqual(true);
    expect(response.body.numero_todo).toEqual(6);
  });

  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l3',
      thematiques: [Thematique.logement],
      difficulty: DifficultyLevel.L1,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.quizz);
    expect(response.body.todo[0].content_id).toEqual('quizz-id-l1');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id-l3',
      thematiques: [Thematique.logement],
      difficulty: DifficultyLevel.L1,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.quizz);
    expect(response.body.todo[0].content_id).toEqual('quizz-id-l1');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat, non 100%, sans essaies', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 20 }] },
        ],
      },
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('quizz', {
      content_id: '1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.quizz);
    expect(response.body.todo[0].content_id).toEqual('3');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat, non 100%, avec essaies', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 20 }] },
        ],
      },
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('quizz', {
      content_id: '1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.quizz);
    expect(response.body.todo[0].content_id).toEqual('2');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });

  it('GET /utilisateurs/id/todo retourne la todo avec une ref d article', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'Lire article',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'article',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('article', {
      content_id: '123',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.article);
    expect(response.body.todo[0].content_id).toEqual('123');
    expect(response.body.todo[0].interaction_id).toEqual(undefined);
  });

  it('GET /utilisateurs/id/todo propose un article déjà lu', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 1,
      history: {
        article_interactions: [
          { content_id: 'article-1', read_date: new Date() },
        ],
      },
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'lire un article',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('article', { content_id: 'article-1' });

    // WHEN
    let response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.article);
    expect(response.body.todo[0].content_id).toEqual('article-1');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });

  it('GET /utilisateurs/id/todo propose un article non lu en prio par rapport à un lu déjà', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 1,
      history: {
        article_interactions: [
          { content_id: 'article-1', read_date: new Date() },
        ],
      },

      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'lire un article',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('article', { content_id: 'article-1' });
    await TestUtil.create('article', { content_id: 'article-2' });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.article);
    expect(response.body.todo[0].content_id).toEqual('article-2');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });
  it('POST /utilisateurs/id/todo/id/gagner_points encaissse les points associé à cet élément', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            todo: [],
            done: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 1, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );

    expect(
      userDB.parcours_todo.getActiveTodo().done[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification['points']).toEqual(20);
  });
  it('POST /utilisateurs/id/todo/id/gagner_points encaissse les points qu une seule fois ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            todo: [],
            done: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 1, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );
    expect(response.status).toBe(200);
    response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );
    expect(response.status).toBe(200);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toEqual(20);
  });
  it('POST /utilisateurs/id/todo/gagner_points encaissse les points d une todo terminée , passe à la todo suivante, et valorise la date de fin', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            todo: [],
            done: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 1, target: 1 },
                sont_points_en_poche: true,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
          {
            numero_todo: 2,
            points_todo: 25,
            todo: [],
            done: [],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/gagner_points',
    );
    expect(response.status).toBe(200);
    // THEN
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUtilisateur.gamification['points']).toEqual(35);
    expect(dbUtilisateur.parcours_todo.getActiveTodo().numero_todo).toEqual(2);
    expect(
      dbUtilisateur.parcours_todo.liste_todo[0].done_at.getTime(),
    ).toBeGreaterThan(Date.now() - 1000);
  });
  it('POST /utilisateurs/id/todo/gagner_points 400 si todo pas faite', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            todo: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
            done: [],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/gagner_points',
    );
    expect(response.status).toBe(400);
    // THEN
    expect(response.body.message).toEqual(
      "todo pas terminée, impossible d'encaisser les points",
    );
  });
  it('POST /utilisateurs/id/todo/gagner_points 400 si todo faite mais d autres points pas encaissés', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            todo: [,],
            done: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 1, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/gagner_points',
    );
    expect(response.status).toBe(400);
    // THEN
    expect(response.body.message).toEqual(
      "todo pas terminée, impossible d'encaisser les points",
    );
  });
  it('POST /utilisateurs/id/todo/id/gagner_points encaissse pas les points d un truc pas fait ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '123',
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );
    expect(response.status).toBe(200);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toEqual(10);
  });
  it('POST /utilisateurs/id/services ajout du service ecowatt sur la todo 3 réalise l objctif', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: LiveService.fruits,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: LiveService.fruits,
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getTodoByNumero(4).done).toHaveLength(1);
    expect(dbUser.parcours_todo.getTodoByNumero(4).done[0].titre).toEqual(
      'Installer "Fruits et légumes de saison"',
    );
    expect(
      dbUser.parcours_todo.getTodoByNumero(4).done[0].progression.current,
    ).toEqual(1);
    expect(
      dbUser.parcours_todo.getTodoByNumero(4).done[0].sont_points_en_poche,
    ).toStrictEqual(false);
  });
  it('POST /utilisateurs/id/services ajout du service fruits sur la todo 3 ne réalise PAS l objctif', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: new ParcoursTodo(),
    });
    await TestUtil.create('serviceDefinition', {
      id: LiveService.fruits,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: LiveService.fruits,
    });

    // THEN
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getTodoByNumero(3).done).toHaveLength(0);
  });

  it('POST /utilisateurs/id/event met à jour la todo si un sous thematique d un articl match v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '1234',
                titre: 'lire 2 article logement',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 2 },
                sont_points_en_poche: false,
                type: ContentType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('article', {
      content_id: '123',
      difficulty: DifficultyLevel.L1,
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.loisir, Thematique.logement],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'article_lu',
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().todo).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().todo[0].progression.current,
    ).toEqual(1);
  });

  it('POST KYC met à jour la todo si la question correspond', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '1234',
                titre: 'repondre à cette question',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.kyc,
                level: DifficultyLevel.ANY,
                content_id: '2',
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('questionsKYC', {
      utilisateurId: 'utilisateur-id',
      data: {
        answered_questions: [
          {
            id: '2',
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: CategorieQuestionKYC.service,
            points: 10,
            reponses_possibles: [
              'Le climat',
              'Mon logement',
              'Ce que je mange',
            ],
          },
        ],
      },
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/2',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().todo).toHaveLength(0);
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
  });
  it('POST /utilisateurs/id/event aides valide un objecif aides', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '1234',
                titre: 'catalogue aides',
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.aides,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'access_catalogue_aides',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });
  it('POST /utilisateurs/id/event aides valide un objecif profile', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '1234',
                titre: 'compte utilisateur',
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.profile,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'access_profile',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });
  it('POST /utilisateurs/id/event aides valide un objecif reco', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                id: '1234',
                titre: 'recommandationss',
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.recommandations,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.access_recommandations,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });

  it('GET /utilisateurs/id/todo répond OK pour todo #1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveLength(1);
    expect(response.body.numero_todo).toEqual(1);
  });
  it('GET /utilisateurs/id/todo répond OK pour todo #2', async () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    parcours.avanceDansParcours();
    await TestUtil.create('utilisateur', {
      todo: parcours,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(2);
  });
  it('GET /utilisateurs/id/todo répond OK pour todo #3', async () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    parcours.avanceDansParcours();
    parcours.avanceDansParcours();
    await TestUtil.create('utilisateur', {
      todo: parcours,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(3);
  });
});
