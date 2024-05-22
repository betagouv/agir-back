import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Univers } from '../../../src/domain/univers/univers';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';

describe('Mission (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        titre: 'test mission',
        done_at: new Date(1),
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        objectifs: [
          {
            id: '0',
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '1',
            content_id: '13',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: true,
            done_at: new Date(0),
          },
          {
            id: '2',
            content_id: '14',
            type: ContentType.quizz,
            titre: 'Super quizz',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '3',
            content_id: '2',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: true,
            done_at: null,
          },
        ],
      },
    ],
  };
  const missions_kyc_done: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        titre: 'test mission',
        done_at: new Date(1),
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        objectifs: [
          {
            id: '0',
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: new Date(),
          },
        ],
      },
    ],
  };
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

  it(`GET /utilisateurs/id/thematiques/climat/mission - renvoie la mission de la thématique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Faut manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: 'Mange de la graine',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.titre).toEqual('test mission');
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.univers).toEqual('alimentation');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
    expect(response.body.univers_label).toEqual('Faut manger !');
    expect(response.body.done_at).toEqual(new Date(1).toISOString());
    expect(response.body.objectifs).toHaveLength(4);

    const item_2 = response.body.objectifs[1];
    expect(item_2.id).toEqual('1');
    expect(item_2.content_id).toEqual('13');
    expect(item_2.type).toEqual(ContentType.article);
    expect(item_2.titre).toEqual('Super article');
    expect(item_2.points).toEqual(10);
    expect(item_2.is_locked).toEqual(true);
    expect(item_2.done_at).toEqual(new Date(0).toISOString());
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie la prochaine question à poser`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.default);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
});