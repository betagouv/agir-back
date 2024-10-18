import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { DB, TestUtil } from '../../TestUtil';
import { LiveService } from '../../../src/domain/service/serviceDefinition';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { EventType } from '../../../src/domain/appEvent';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { TodoCatalogue } from '../../../src/domain/todo/todoCatalogue';
import {
  ParcoursTodo_v0,
  Todo_v0,
} from '../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { CelebrationType } from '../../../src/domain/gamification/celebrations/celebration';
import { Feature } from '../../../src/domain/gamification/feature';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';
import { Tag } from '../../../src/domain/scoring/tag';
import { Univers } from '../../../src/domain/univers/univers';
import { KYC } from '@prisma/client';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import {
  MosaicKYC,
  TypeReponseMosaicKYC,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';

describe('TODO list (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/todo retourne la todo liste courante seule', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          titre: 'Mission',
          numero_todo: 1,
          points_todo: 25,
          done_at: null,
          imageUrl: 'https://',
          done: [],
          celebration: {
            id: '123',
            titre: 'Nouvelle Fonctionnalité',
            type: CelebrationType.reveal,
            reveal: {
              id: '456',
              titre: 'Vos recommandations',
              description: `Toujours plus de contenu, et en fonction de vos centres d'intérêt`,
              feature: Feature.recommandations,
            },
          },
          todo: [
            {
              id: '123456',
              titre: 'faire quizz climat',
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
    };
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: todo,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.points_todo).toEqual(25);
    expect(response.body.titre).toEqual(`Mission`);
    expect(response.body.imageUrl).toEqual('https://');
    expect(response.body.celebration).toStrictEqual({
      id: '123',
      titre: 'Nouvelle Fonctionnalité',
      type: CelebrationType.reveal,
      reveal: {
        id: '456',
        titre: 'Vos recommandations',
        description: `Toujours plus de contenu, et en fonction de vos centres d'intérêt`,
        feature: Feature.recommandations,
      },
    });
    expect(response.body.todo[0].titre).toEqual('faire quizz climat');
    expect(response.body.todo[0].progression).toEqual({
      current: 0,
      target: 1,
    });
    expect(response.body.is_last).toEqual(false);
    expect(response.body.todo[0].sont_points_en_poche).toEqual(false);
    expect(response.body.todo[0].type).toEqual('quizz');
    expect(response.body.todo[0].points).toEqual(10);
    expect(response.body.todo[0].thematiques).toEqual(['climat']);
  });
  it('GET /utilisateurs/id/todo generation ID correcte', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo[0].id.length).toBeGreaterThan(12);
  });
  it('GET /utilisateurs/id/todo retourne la todo avec le champ aide et done_at, ainsi que todo_end = false', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          done_at: new Date(),
          titre: 'uo',
          imageUrl: 'http',
          celebration: null,
          done: [],
          todo: [
            {
              id: '123',
              titre: 'faire quizz climat',
              progression: { current: 0, target: 1 },
              sont_points_en_poche: false,
              type: ContentType.aide,
              url: '/aides',
              points: 10,
            },
          ],
        },
      ],
      todo_active: 0,
    };
    await TestUtil.create(DB.utilisateur, { todo: todo });

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
    todo.todo_active = TodoCatalogue.getNombreTodo();
    await TestUtil.create(DB.utilisateur, {
      todo: todo,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('Plus de mission, pour le moment...');
    expect(response.body.is_last).toEqual(true);
    expect(response.body.numero_todo).toEqual(
      TodoCatalogue.getNombreTodo() + 1,
    );
  });

  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          titre: 'uo',
          imageUrl: 'http',
          celebration: null,
          done_at: null,
          done: [],
          todo: [
            {
              titre: 'faire quizz climat',
              thematiques: [Thematique.climat],
              progression: { current: 0, target: 1 },
              sont_points_en_poche: false,
              type: ContentType.quizz,
              level: DifficultyLevel.L1,
              points: 10,
              id: '123',
            },
          ],
        },
      ],
      todo_active: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: todo,
    });
    await TestUtil.create(DB.quizz, {
      content_id: 'quizz-id-l1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: 'quizz-id-l2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
  it('GET /utilisateurs/id/todo retourne la todo n°1 pas de quizz hors reco', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          done: [],
          celebration: null,
          done_at: null,
          imageUrl: 'hhtp',
          titre: 'DFGHJ',
          todo: [
            {
              titre: 'faire quizz climat',
              thematiques: [Thematique.climat],
              progression: { current: 0, target: 1 },
              sont_points_en_poche: false,
              type: ContentType.quizz,
              level: DifficultyLevel.L1,
              points: 10,
              id: '123',
            },
          ],
        },
      ],
      todo_active: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: todo,
    });
    await TestUtil.create(DB.quizz, {
      content_id: 'quizz-id-l1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
      categorie: Categorie.mission,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].content_id).toEqual(undefined);
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          done: [],
          done_at: null,
          celebration: null,
          imageUrl: 'http',
          titre: 'FGHJK',
          todo: [
            {
              titre: 'faire quizz climat',
              thematiques: [Thematique.climat],
              progression: { current: 0, target: 1 },
              sont_points_en_poche: false,
              type: ContentType.quizz,
              level: DifficultyLevel.L1,
              points: 10,
              id: '123',
            },
          ],
        },
      ],
      todo_active: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: todo,
    });
    await TestUtil.create(DB.quizz, {
      content_id: 'quizz-id-l1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: 'quizz-id-l2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L2,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create(DB.quizz, {
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.article, {
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

  it('GET /utilisateurs/id/todo retourne la todo avec un enchainement de KYC et mosaics', async () => {
    // GIVEN
    QuestionKYCUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, 'TEST_MOSAIC_ID'],
    };
    MosaicKYC.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID.KYC003, KYCID.KYC004],
      },
    ];

    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'Enchainement',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: ContentType.enchainement_kyc,
                level: DifficultyLevel.L1,
                points: 10,
                content_id: 'ENCHAINEMENT_KYC_1',
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: 'KYC001',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: 'KYC002',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: 'KYC003',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: 'KYC004',
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo[0]).toEqual({
      titre: 'Enchainement',
      type: 'enchainement_kyc',
      level: 1,
      content_id: 'ENCHAINEMENT_KYC_1',
      points: 10,
      progression: { current: 0, target: 3 },
      sont_points_en_poche: false,
      thematiques: ['climat'],
    });
  });

  it('GET /utilisateurs/id/todo retourne la todo avec un enchainement de KYC terminée', async () => {
    // GIVEN
    QuestionKYCUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCID.KYC002, 'TEST_MOSAIC_ID'],
    };
    MosaicKYC.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID.KYC003, KYCID.KYC004],
      },
    ];

    await TestUtil.create(DB.utilisateur, {
      version: 2,
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'Enchainement',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 3 },
                sont_points_en_poche: false,
                type: ContentType.enchainement_kyc,
                level: DifficultyLevel.L1,
                points: 10,
                content_id: 'ENCHAINEMENT_KYC_1',
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
    };

    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: 'KYC001',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: 'KYC002',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      code: 'KYC003',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 4',
      code: 'KYC004',
    });

    // WHEN
    let R = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Oui'] });
    expect(R.status).toEqual(200);
    R = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC002',
    ).send({ reponse: ['Oui'] });
    expect(R.status).toEqual(200);
    R = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({
      reponse_mosaic: [
        { code: KYCID.KYC003, boolean_value: true },
        { code: KYCID.KYC004, boolean_value: false },
      ],
    });
    expect(R.status).toEqual(200);

    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveLength(0);
    expect(response.body.done[0]).toEqual({
      titre: 'Enchainement',
      type: 'enchainement_kyc',
      level: 1,
      content_id: 'ENCHAINEMENT_KYC_1',
      points: 10,
      progression: { current: 3, target: 3 },
      sont_points_en_poche: false,
      thematiques: ['climat'],
    });
  });
  it('GET /utilisateurs/id/todo retourne la todo avec une ref d article en dur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
                content_id: '12345',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create(DB.article, {
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
    expect(response.body.todo[0].content_id).toEqual('12345');
    expect(response.body.todo[0].interaction_id).toEqual(undefined);
  });
  it('GET /utilisateurs/id/todo ne propose pas un article pas du bon code postal', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '49000',
      chauffage: Chauffage.bois,
      commune: 'ANGERS',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, {
      version: 2,
      logement: logement,
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

    await TestUtil.create(DB.article, {
      content_id: '123',
      thematiques: [Thematique.climat],
      difficulty: DifficultyLevel.L1,
      codes_postaux: ['91120'],
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.article);
    expect(response.body.todo[0].content_id).toEqual(undefined);
  });

  it('GET /utilisateurs/id/todo propose un article déjà lu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.article, {
      content_id: 'article-1',
      thematiques: [Thematique.climat],
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(ContentType.article);
    expect(response.body.todo[0].content_id).toEqual('article-1');
    expect(response.body.todo[0].interaction_id).toBeUndefined();
  });

  it('GET /utilisateurs/id/todo propose un article non lu en prio par rapport à un lu déjà', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.article, { content_id: 'article-1' });
    await TestUtil.create(DB.article, {
      content_id: 'article-2',
      thematiques: [Thematique.climat],
    });

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
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.parcours_todo.getActiveTodo().done[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification['points']).toEqual(20);
  });
  it('POST /utilisateurs/id/todo/id/gagner_points encaissse les points qu une seule fois ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );
    expect(response.status).toBe(201);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toEqual(20);
  });
  it('POST /utilisateurs/id/todo/gagner_points encaissse les points d une todo terminée , passe à la todo suivante, et valorise la date de fin', async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          done_at: null,
          celebration: {
            id: '123',
            titre: 'Nouvelle Fonctionnalité',
            type: CelebrationType.reveal,
            reveal: {
              id: '456',
              titre: 'Vos recommandations',
              description: `Toujours plus de contenu, et en fonction de vos centres d'intérêt`,
              feature: Feature.recommandations,
            },
          },
          imageUrl: 'http',
          titre: 'YU',
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
          celebration: null,
          done_at: null,
          imageUrl: 'hhttp',
          titre: 'fin',
        },
      ],
      todo_active: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      todo: todo,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/gagner_points',
    );
    expect(response.status).toBe(201);
    // THEN
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification['points']).toEqual(35);
    expect(dbUtilisateur.parcours_todo.getActiveTodo().numero_todo).toEqual(2);
    expect(
      dbUtilisateur.parcours_todo.liste_todo[0].done_at.getTime(),
    ).toBeGreaterThan(Date.now() - 1000);
    expect(
      dbUtilisateur.unlocked_features.isUnlocked(Feature.recommandations),
    ).toEqual(true);
  });
  it('POST /utilisateurs/id/todo/gagner_points 400 si todo pas faite', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    const response = await TestUtil.POST(
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.utilisateur, {
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/gagner_points',
    );
    expect(response.status).toBe(201);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toEqual(10);
  });

  it(`POST /utilisateurs/id/event voir la conf lonky valide l'objectif`, async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = {
      version: 0,
      todo_active: 0,
      liste_todo: [
        {
          numero_todo: 1,
          points_todo: 25,
          done_at: null,
          celebration: null,
          imageUrl: 'https://',
          titre: 'mission 1',
          todo: [
            {
              id: '123',
              titre: 'voir la conf linky',
              thematiques: [Thematique.climat],
              progression: { current: 0, target: 1 },
              sont_points_en_poche: true,
              service_id: LiveService.linky,
              type: ContentType.service,
              level: DifficultyLevel.L1,
              points: 10,
            },
          ],
          done: [],
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      todo: todo,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'access_conf_linky',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.liste_todo[0].done).toHaveLength(1);
    expect(dbUser.parcours_todo.liste_todo[0].done[0].isDone()).toEqual(true);
    expect(
      dbUser.parcours_todo.liste_todo[0].done[0].progression.current,
    ).toEqual(1);
  });

  it('POST /utilisateurs/id/event met à jour la todo si un sous thematique d un articl match v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.article, {
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
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.getActiveTodo().todo).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().todo[0].progression.current,
    ).toEqual(1);
  });

  it('POST KYC met à jour la todo si la question correspond', async () => {
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID._1,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.recommandation,
          points: 10,
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
          ],
          tags: [],
          universes: [],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [],
        },
      ],
    };
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
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
                content_id: '_1',
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.recommandation,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_1',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.getActiveTodo().todo).toHaveLength(0);
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
  });
  it('POST /utilisateurs/id/event aides valide un objecif aides', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });
  it('POST /utilisateurs/id/event aides valide un objecif profile', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });
  it('POST /utilisateurs/id/event aides valide un objecif reco', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.parcours_todo.getActiveTodo().done).toHaveLength(1);
    expect(
      dbUser.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
    expect(dbUser.parcours_todo.getActiveTodo().done[0].id).toEqual('1234');
  });

  it('GET /utilisateurs/id/todo répond OK pour todo #2', async () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    parcours.avanceDansParcours();
    await TestUtil.create(DB.utilisateur, {
      todo: parcours,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(2);
  });
});
