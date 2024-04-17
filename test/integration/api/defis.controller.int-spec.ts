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
import { DefiDefinition } from '../../../src/domain/defis/defiDefinition';

const DEFI_1_DEF: DefiDefinition = {
  content_id: '1',
  points: 5,
  tags: [Tag.utilise_moto_ou_voiture],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
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
  });
  it('GET /defis - liste defis de l utilisateur', async () => {
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
  });
  it('GET /utilisateurs/id/defis/id - correct data defis du catalogue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      defis: {
        defis: [DEFI_1],
      },
    });
    ThematiqueRepository.resetThematiques();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await thematiqueRepository.loadThematiques();

    /*
    await TestUtil.create(DB.defi, {
      content_id: '1',
      points: 5,
      tags: [Tag.transport],
      titre: 'titre',
      thematique: Thematique.alimentation,
      astuces: 'astuce',
      date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
      pourquoi: 'pourquoi',
      sous_titre: 'sous_titre',
      status: DefiStatus.todo,
    });
    */

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
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { defis: defis });
    ThematiqueRepository.resetThematiques();
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
