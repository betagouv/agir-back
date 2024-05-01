import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { DefiAPI } from '../../../src/infrastructure/api/types/defis/DefiAPI';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../src/domain/univers/univers';
import { Defi } from '.prisma/client';
import { PonderationApplicativeManager } from '../../../src/domain/scoring/ponderationApplicative';
import { TagRubrique } from '../../../src/domain/scoring/tagRubrique';

const DEFI_1_DEF: Defi = {
  content_id: '1',
  points: 5,
  tags: [Tag.utilise_moto_ou_voiture],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  universes: [Univers.climat],
  thematiquesUnivers: [ThematiqueUnivers.dechets_compost],
  created_at: undefined,
  updated_at: undefined,
};

describe('/utilisateurs/id/defis (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const DAY_IN_MS = 1000 * 60 * 60 * 24;

  const DEFI_1: Defi_v0 = {
    id: '1',
    points: 5,
    tags: [Tag.utilise_moto_ou_voiture],
    titre: 'titre',
    thematique: Thematique.alimentation,
    astuces: 'astuce',
    date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
    pourquoi: 'pourquoi',
    sous_titre: 'sous_titre',
    status: DefiStatus.todo,
    universes: [Univers.climat],
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

  it('GET /defis - liste defis catalogue', async () => {
    // GIVEN
    await TestUtil.create(DB.defi, DEFI_1_DEF);
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET('/defis');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toEqual('1');
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].thematique).toEqual('alimentation');
    expect(response.body[0].thematique_label).toEqual('alimentation');
    expect(response.body[0].points).toEqual(5);
    expect(response.body[0].status_defi).toBeUndefined();
    expect(response.body[0].jours_restants).toBeNull();
    expect(response.body[0].universes).toEqual([Univers.climat]);
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.deja_fait,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.abondon,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/defis');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('001');
    expect(defi.points).toBe(5);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('astuce');
    expect(defi.pourquoi).toBe('pourquoi');
    expect(defi.jours_restants).toBe(4);
    expect(defi.titre).toBe('titre');
    expect(defi.sous_titre).toBe('sous_titre');
    expect(defi.status).toBe(DefiStatus.en_cours);
    expect(defi.universes[0]).toBe(Univers.climat);
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status encours', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.deja_fait,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=en_cours',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('1');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status todo', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.deja_fait,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('3');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status todo et univers', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      universes: [Univers.alimentation],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      universes: [Univers.climat],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      universes: [Univers.logement],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo&univers=climat',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('2');
  });

  it('GET /utilisateurs/id/defis?status=todo - liste des défis à a faire par ordre de reco', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        R1: 10,
        R2: 20,
        R3: 30,
      },
      noel: {},
      exp: {},
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [TagRubrique.R3],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [TagRubrique.R1],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [TagRubrique.R2],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].id).toEqual('1');
    expect(response.body[1].id).toEqual('3');
    expect(response.body[2].id).toEqual('2');
  });
  it('GET /utilisateurs/id/defis/id - correct data defis du catalogue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      defis: {
        defis: [DEFI_1],
      },
    });
    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/defis/1');

    // THEN
    expect(response.status).toBe(200);

    const defi: DefiAPI = response.body;

    expect(defi.id).toBe('1');
    expect(defi.points).toBe(5);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('astuce');
    expect(defi.pourquoi).toBe('pourquoi');
    expect(defi.jours_restants).toBe(4);
    expect(defi.titre).toBe('titre');
    expect(defi.sous_titre).toBe('sous_titre');
    expect(defi.thematique_label).toBe('t1');
    expect(defi.status).toBe(DefiStatus.todo);
  });
  it('GET /utilisateurs/id/defis/id - correct data defis utlisateur', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '001',
          points: 10,
          tags: [Tag.R10],
          titre: 'titre',
          thematique: Thematique.alimentation,
          astuces: 'ASTUCE',
          date_acceptation: new Date(Date.now() - 2 * DAY_IN_MS),
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.en_cours,
          universes: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { defis: defis });
    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis/001',
    );

    // THEN
    expect(response.status).toBe(200);

    const defi: DefiAPI = response.body;

    expect(defi.id).toBe('001');
    expect(defi.points).toBe(10);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('ASTUCE');
    expect(defi.pourquoi).toBe('POURQUOI');
    expect(defi.jours_restants).toBe(5);
    expect(defi.titre).toBe('titre');
    expect(defi.sous_titre).toBe('SOUS TITRE');
    expect(defi.thematique_label).toBe('t1');
    expect(defi.status).toBe(DefiStatus.en_cours);
  });
  it('PATCH /utilisateurs/id/defis/id - patch le status d un defi en cours', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '001',
          points: 10,
          tags: [Tag.R10],
          titre: 'titre',
          thematique: Thematique.alimentation,
          astuces: 'ASTUCE',
          date_acceptation: new Date(Date.now() - 2 * DAY_IN_MS),
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.en_cours,
          universes: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { defis: defis });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/001',
    ).send({
      status: DefiStatus.fait,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.defi_history.getDefiOrException('001').getStatus()).toBe(
      DefiStatus.fait,
    );
  });
  it('PATCH /utilisateurs/id/defis/id - patch le status d un defi du catalogue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.defi, DEFI_1_DEF);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.en_cours,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    const defi = userDB.defi_history.getDefiOrException('1');

    expect(defi.getStatus()).toBe(DefiStatus.en_cours);
    expect(defi.date_acceptation.getTime() + 100).toBeGreaterThan(Date.now());
    expect(defi.date_acceptation.getTime() - 100).toBeLessThan(Date.now());
    expect(userDB.defi_history.defis).toHaveLength(2);
  });
  it('PATCH /utilisateurs/id/defis/id - ajout de points', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.defi, DEFI_1_DEF);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.fait,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.gamification.points).toBe(15);
  });
});
