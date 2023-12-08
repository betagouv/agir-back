import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { Thematique } from '../../../src/domain/thematique';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import {
  LiveService,
  ScheduledService,
} from '../../../src/domain/service/serviceDefinition';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { RevealType } from '../../../src/domain/gamification/celebrations/reveal';

describe('TODO list (API test)', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

  it('GET /utilisateurs/id/todo retourne la todo liste courante seule', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.points_todo).toEqual(25);
    expect(response.body.todo[0].id.length).toBeGreaterThan(12);
    expect(response.body.todo[0].titre).toEqual(
      'Faire un premier quizz climat - facile',
    );
    expect(response.body.todo[0].progression).toEqual({
      current: 0,
      target: 1,
    });
    expect(response.body.todo[0].sont_points_en_poche).toEqual(false);
    expect(response.body.todo[0].type).toEqual('quizz');
    expect(response.body.todo[0].points).toEqual(10);
    expect(response.body.todo[0].thematiques).toEqual(['climat']);
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
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
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'quizz-id-l1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.quizz,
      done: false,
      quizz_score: null,
    });
    await TestUtil.create('interaction', {
      id: '2',
      content_id: 'quizz-id-l2',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L2,
      type: InteractionType.quizz,
      done: false,
      quizz_score: null,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.quizz);
    expect(response.body.todo[0].content_id).toEqual('quizz-id-l1');
    expect(response.body.todo[0].interaction_id).toEqual('1');
  });
  it('GET /utilisateurs/id/todo retourne la todo avec un article basé sur la thématique non gamification', async () => {
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
                titre: 'article',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'article-1',
      thematiques: [Thematique.climat, Thematique.logement],
      difficulty: DifficultyLevel.L1,
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '2',
      content_id: 'article-1',
      thematiques: [Thematique.climat, Thematique.alimentation],
      difficulty: DifficultyLevel.L2,
      type: InteractionType.article,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.article);
    expect(response.body.todo[0].content_id).toEqual('article-1');
    expect(response.body.todo[0].interaction_id).toEqual('1');
  });
  it('GET /utilisateurs/id/todo retourne la todo avec une ref d article', async () => {
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
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'article-id-1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.article,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.article);
    expect(response.body.todo[0].content_id).toEqual('article-id-1');
    expect(response.body.todo[0].interaction_id).toEqual('1');
  });
  it('GET /utilisateurs/id/todo retourne la todo avec quizz tout frais, si échec du quizz, ce quizz est tjrs proposé dans la todo', async () => {
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
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'quizz-id-l1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.quizz,
      done: true,
      quizz_score: 0,
    });

    // WHEN
    let response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.quizz);
    expect(response.body.todo[0].content_id).toEqual('quizz-id-l1');
    expect(response.body.todo[0].interaction_id).toEqual('1');

    // WHEN
    response = await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: 'quizz_score',
      interaction_id: '1',
      number_value: 100,
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
  });
  it('GET /utilisateurs/id/todo retourne la todo sans pointeur car le seul quizz déjà réussi', async () => {
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
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'quizz-id-l1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.quizz,
      done: true,
      quizz_score: 100,
    });

    // WHEN
    let response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.quizz);
    expect(response.body.todo[0].content_id).toBeUndefined();
  });
  it('GET /utilisateurs/id/todo propose un article déjà lu', async () => {
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
                titre: 'lire un article',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'article-1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.article,
      done: true,
    });

    // WHEN
    let response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.article);
    expect(response.body.todo[0].content_id).toEqual('article-1');
    expect(response.body.todo[0].interaction_id).toEqual('1');

    // WHEN
    response = await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: 'article_lu',
      interaction_id: '1',
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
  });
  it('GET /utilisateurs/id/todo propose un article non lu en prio par rapport à un lu déjà', async () => {
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
                titre: 'lire un article',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'article-1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.article,
      done: true,
    });
    await TestUtil.create('interaction', {
      id: '2',
      content_id: 'article-2',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.article,
      done: false,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.article);
    expect(response.body.todo[0].content_id).toEqual('article-2');
    expect(response.body.todo[0].interaction_id).toEqual('2');
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
                type: InteractionType.quizz,
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
                type: InteractionType.quizz,
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
  it('POST /utilisateurs/id/todo/gagner_points encaissse les points d une todo terminée , passe à la todo suivante', async () => {
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
                type: InteractionType.quizz,
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
                type: InteractionType.quizz,
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
                type: InteractionType.quizz,
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
                type: InteractionType.quizz,
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
      id: ScheduledService.ecowatt,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: ScheduledService.ecowatt,
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getTodoByNumero(3).done).toHaveLength(1);
    expect(dbUser.parcours_todo.getTodoByNumero(3).done[0].titre).toEqual(
      'Installer le service EcoWATT',
    );
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
  it('POST /utilisateurs/id/event met à jour la todo si un sous thematique du quizz match', async () => {
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
                titre: 'Faire un premier quizz climat - facile',
                thematiques: [Thematique.climat, Thematique.logement],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: InteractionType.quizz,
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      type: InteractionType.quizz,
      done: false,
      difficulty: DifficultyLevel.L1,
      thematiques: [Thematique.loisir, Thematique.logement],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'quizz_score',
      number_value: 100,
      interaction_id: 'interaction-id',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
  });
  it('POST /utilisateurs/id/event met à jour la todo si un sous thematique d un articl match', async () => {
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
                titre: 'lire 2 article logement',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 2 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      type: InteractionType.article,
      done: false,
      difficulty: DifficultyLevel.L1,
      thematique_gamification: Thematique.climat,
      thematiques: [Thematique.loisir, Thematique.logement],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'article_lu',
      interaction_id: 'interaction-id',
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
  it('POST /utilisateurs/id/event met à jour la todo si un sous thematique d un articl match', async () => {
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
                titre: 'lire 2 article logement',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 2 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create('interaction', {
      type: InteractionType.article,
      done: false,
      difficulty: DifficultyLevel.L1,
      thematique_gamification: Thematique.climat,
      thematiques: [Thematique.loisir, Thematique.logement],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'article_lu',
      interaction_id: 'interaction-id',
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
  it('POST /utilisateurs/id/event delcenche un reveal si un objectif de la todo realise l indique', async () => {
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
                titre: 'lire 1 article logement',
                thematiques: [Thematique.logement],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: InteractionType.article,
                level: DifficultyLevel.ANY,
                points: 10,
                reveal: RevealType.aides,
              },
            ],
          },
        ],
        todo_active: 0,
      },
      gamification: { points: 0 },
    });
    await TestUtil.create('interaction', {
      type: InteractionType.article,
      done: false,
      difficulty: DifficultyLevel.L1,
      thematique_gamification: Thematique.climat,
      thematiques: [Thematique.logement],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'article_lu',
      interaction_id: 'interaction-id',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUser.gamification.reveals).toHaveLength(1);
    expect(dbUser.gamification.reveals[0].type).toEqual(RevealType.aides);
  });
  it('GET /utilisateurs/id/todo répond OK pour todo #1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveLength(1);
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
    expect(response.body.todo).toHaveLength(2);
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
    expect(response.body.todo).toHaveLength(2);
    expect(response.body.numero_todo).toEqual(3);
  });
});
