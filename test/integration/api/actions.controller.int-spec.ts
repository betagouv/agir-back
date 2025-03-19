import { Consultation } from '../../../src/domain/actions/catalogueAction';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { KYCHistory_v2 } from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { BlockTextRepository } from '../../../src/infrastructure/repository/blockText.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { FAQRepository } from '../../../src/infrastructure/repository/faq.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Actions (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
  );
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const fAQRepository = new FAQRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  let blockTextRepository = new BlockTextRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await actionRepository.loadCache();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`GET /actions - liste le catalogue d'action sans filtre`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: false,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: false,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('code_fonct');
    expect(action.titre).toEqual('The titre');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.thematique).toEqual(Thematique.consommation);
    expect(action.type).toEqual(TypeAction.classique);
    expect(action.nombre_actions_en_cours).toEqual(0);
    expect(action.nombre_aides_disponibles).toEqual(0);
  });
  it(`GET /actions - liste le catalogue d'action avec filtre thematique unique`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?thematique=alimentation');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('1');
  });
  it(`GET /actions - liste le catalogue recherche texte titre`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?titre=tou');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('2');
  });
  it(`GET /actions - liste le catalogue d'action avec filtre thematique multiple`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.climat,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/actions?thematique=alimentation&thematique=logement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: true,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: true,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);
  });
  it(`GET /actions - liste le catalogue d'action : données de base`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: 'code_fonct',
      besoins: ['composter'],
    });
    await TestUtil.create(DB.compteurActions, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      faites: 45,
      vues: 154,
    });
    await compteurActionsRepository.loadCache();
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    expect(response.body.actions[0]).toEqual({
      code: 'code_fonct',
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 0,
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: 'The titre',
      type: 'classique',
      points: 100,
    });
  });
  it(`GET /actions - liste le catalogue d'action : accroche nbre aide si code insee`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.nombre_aides_disponibles).toEqual(1);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.compteurActions, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      faites: 45,
      vues: 154,
    });
    await compteurActionsRepository.loadCache();

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action).toEqual({
      code: '123',
      deja_faite: false,
      deja_vue: false,
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 1,
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: 'The titre',
      type: 'classique',
      points: 100,
    });
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.climat,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?thematique=alimentation&thematique=logement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);

    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: true,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: true,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre titre textuel`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?titre=belle',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
  });

  it(`GET /utilisateurs/id/actions - filtre consultation`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [{ code: '1', type: TypeAction.classique }],
      liste_actions_faites: [],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=vu',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
    expect(response.body.consultation).toEqual(Consultation.vu);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=pas_vu',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('2');
    expect(response.body.consultation).toEqual(Consultation.pas_vu);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=tout',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.consultation).toEqual(Consultation.tout);

    // WHEN
    response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.consultation).toEqual(Consultation.tout);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=blablabla',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Type de consultation [blablabla] inconnu',
    );
  });

  it(`GET /utilisateurs/id/actions - boolean action deja vue / deja faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_tags_excluants: [],
      liste_actions_vues: [{ type: TypeAction.classique, code: '123' }],
      liste_actions_faites: [{ type: TypeAction.classique, code: '123' }],
      liste_thematiques: [],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });

    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.deja_vue).toEqual(true);
    expect(action.deja_faite).toEqual(true);
  });

  it(`GET /actions/type/id - consulte le détail d'une action`, async () => {
    // GIVEN
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();
    await TestUtil.create(DB.action, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      label_compteur: '{NBR_ACTIONS} haha',
      pourquoi: 'en quelques mots {block_123}',
      sources: [{ url: 'haha', label: 'hoho' }],
    });
    await TestUtil.create(DB.compteurActions, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      faites: 45,
      vues: 154,
    });
    await actionRepository.onApplicationBootstrap();
    await compteurActionsRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/code_fonct');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action).toEqual({
      aides: [],
      besoins: [],
      code: 'code_fonct',
      comment: 'Astuces',
      consigne: 'consigne',
      faqs: [],
      kycs: [],
      label_compteur: '45 haha',
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 0,
      points: 100,
      pourquoi: 'en quelques mots the texte',
      quizz_felicitations: 'bien',
      quizzes: [],
      services: [
        {
          categorie: 'dinde_volaille',
          recherche_service_id: 'recettes',
        },
        {
          categorie: 'emprunter',
          recherche_service_id: 'longue_vie_objets',
        },
      ],
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: 'The titre',
      type: 'classique',
      sources: [
        {
          label: 'hoho',
          url: 'haha',
        },
      ],
    });
  });

  it(`GET /actions/id - accorche les aides par le besoin - seulement nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.National,
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.National,
      est_gratuit: true,
    });

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.besoins).toEqual(['composter']);
    expect(action.aides).toEqual([
      {
        content_id: '2',
        echelle: 'National',
        montant_max: 999,
        partenaire_logo_url: 'logo_url',
        partenaire_nom: 'ADEME',
        partenaire_url: 'https://ademe.fr',
        titre: 'titreA',
        est_gratuit: true,
      },
    ]);
  });
  it(`GET /actions/id - pas d'aide nationnale expirée`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.National,
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });

  it(`GET /actions/id - accroche les aides par le besoin - pas d'aide non nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.Département,
    });

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });
  it(`GET /actions/id - les éléments de FAQ`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', faq_ids: ['456'] });
    await TestUtil.create(DB.fAQ, { id_cms: '456' });

    await fAQRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.faqs).toEqual([
      {
        question: 'question',
        reponse: 'reponse',
      },
    ]);
  });

  it(`GET /actions/id - accorche une aide qui match un code insee de commune`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/actions/classique/123?code_commune=21231',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(2);
    expect(action.nom_commune).toEqual('Dijon');
  });

  it(`GET /utilisateurs/id/actions/id - detail standard d'une action utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      label_compteur: '{NBR_ACTIONS} haha',
      besoins: ['composter'],
      pourquoi: 'haha {block_123}',
      sources: [{ url: 'haha', label: 'hoho' }],
    });
    await TestUtil.create(DB.compteurActions, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      faites: 45,
      vues: 154,
    });
    await actionRepository.onApplicationBootstrap();
    await compteurActionsRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      aides: [],
      besoins: ['composter'],
      code: '123',
      comment: 'Astuces',
      consigne: 'consigne',
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      deja_faite: false,
      deja_vue: false,
      faqs: [],
      kycs: [],
      label_compteur: '45 haha',
      nom_commune: 'Dijon',
      nombre_aides_disponibles: 0,
      pourquoi: 'haha the texte',
      quizz_felicitations: 'bien',
      quizzes: [],
      services: [
        {
          categorie: 'dinde_volaille',
          recherche_service_id: 'recettes',
        },
        {
          categorie: 'emprunter',
          recherche_service_id: 'longue_vie_objets',
        },
      ],
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: 'The titre',
      type: 'classique',
      points: 100,
      sources: [
        {
          label: 'hoho',
          url: 'haha',
        },
      ],
    });
  });

  it(`GET /utilisateurs/id/actions/id - accorche une aide qui match le code insee de commune de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(2);
    expect(action.nom_commune).toEqual('Dijon');
  });

  it(`GET /utilisateurs/id/actions/id - accorche les faqs`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123', faq_ids: ['456'] });
    await TestUtil.create(DB.fAQ, { id_cms: '456' });

    await fAQRepository.loadCache();
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;
    expect(action.faqs).toEqual([
      {
        question: 'question',
        reponse: 'reponse',
      },
    ]);
  });

  it(`GET /utilisateurs/id/actions/id - consultation track une action comme vue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123' });

    // THEN
    const userDB_before = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.thematique_history],
    );

    expect(
      userDB_before.thematique_history.isActionVue({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(false);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.deja_vue).toEqual(false);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.thematique_history,
    ]);

    expect(
      userDB.thematique_history.isActionVue({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);

    // WHEN
    const response_2 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response_2.status).toBe(200);
    expect(response_2.body.deja_vue).toEqual(true);
  });

  it(`GET /utilisateurs/id/actions/id - action de type simulateur doit contenir une liste de KYCs (quelles soient répondues ou non)`, async () => {
    // GIVEN
    const KYC2 = {
      id_cms: 502,
      code: 'KYC2',
      type: TypeReponseQuestionKYC.entier,
      question: '',
      categorie: Categorie.test,
      points: 0,
      is_ngc: false,
      tags: [],
      thematique: Thematique.alimentation,
      conditions: [],
    };
    await TestUtil.create(DB.kYC, { id_cms: 501, code: 'KYC1' });
    await TestUtil.create(DB.kYC, KYC2 as any);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC2,
          is_NGC: false,
          last_update: undefined,
          reponse_complexe: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      kyc: kyc as any,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.simulateur,
      kyc_codes: ['KYC1', 'KYC2'],
    });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/simulateur/123',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.kycs).toHaveLength(2);
  });

  it(`GET /utilisateurs/id/actions/id - accroche les quizz liés à l'action`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['456'],
      type: TypeAction.quizz,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '456',
      article_id: '1',
      questions: {
        liste_questions: [
          {
            libelle: "Qu'est-ce qu'un embout mousseur ?",
            reponses: [
              {
                reponse: "Un composant d'une bombe de crème chantilly",
                est_bonne_reponse: false,
              },
              {
                reponse: "Un élément d'une tireuse à bière",
                est_bonne_reponse: false,
              },
              {
                reponse: "Un dispositif réduisant le débit d'eau du robinet",
                est_bonne_reponse: true,
              },
            ],
            explication_ko: 'ko',
            explication_ok: 'ok',
          },
        ],
      },
      titre: 'titreA',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire_id: undefined,
      tags_utilisateur: [],
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: [],
      duree: 'pas long',
      frequence: 'souvent',
      difficulty: 1,
      points: 10,
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      created_at: undefined,
      updated_at: undefined,
      categorie: Categorie.recommandation,
      mois: [],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/quizz/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.quizzes).toHaveLength(1);
    expect(action.quizzes[0]).toEqual({
      article_id: '1',
      content_id: '456',
      difficulty: 1,
      duree: 'pas long',
      points: 10,
      questions: [
        {
          explicationKO: 'ko',
          explicationOk: 'ok',
          libelle: "Qu'est-ce qu'un embout mousseur ?",
          reponses: [
            {
              exact: false,
              reponse: "Un composant d'une bombe de crème chantilly",
            },
            {
              exact: false,
              reponse: "Un élément d'une tireuse à bière",
            },
            {
              exact: true,
              reponse: "Un dispositif réduisant le débit d'eau du robinet",
            },
          ],
        },
      ],
      sousTitre: 'sousTitre',
      thematique_principale: 'climat',
      titre: 'titreA',
    });
  });

  it(`GET /utilisateurs/id/actions/id/score - calcul le score d'une action quizz`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3'],
      type: TypeAction.quizz,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/quizz/123/score',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_bonnes_reponses: 2,
      nombre_quizz_done: 3,
    });
  });

  it(`GET /utilisateurs/id/actions/id/faite - gagne les points sur quizz si 4 réponses sur 6`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });

    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '6', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    console.log(response.body);
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(20);
    expect(userDB.gamification.getPoints()).toEqual(20);
  });

  it(`GET /utilisateurs/id/actions/id/faite - gagne PAS les points sur quizz si 3 réponses sur 6`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '6', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    expect(response.status).toBe(400);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(0);
    expect(userDB.gamification.getPoints()).toEqual(0);
  });

  it(`GET /utilisateurs/id/actions/id/faite - pas terminable si pas toutes les réponses`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    expect(response.status).toBe(400);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(0);
    expect(userDB.gamification.getPoints()).toEqual(0);
  });

  it(`GET /actions/id - pas d'aide expirée locale`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET(
      '/actions/classique/123?code_commune=21231',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });

  it(`GET /actions/id - 404 si action non trouvée`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/bad_code');

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /actions/id - 400 si type d'actions inconnu`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/truc/code_fonct');

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(`Type d'action [truc] inconnu`);
  });

  it(`GET /actions - liste le catalogue d'action : 400 si thematique inconnue`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code1',
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code2',
      cms_id: '2',
      code: 'code2',
      thematique: Thematique.consommation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?thematique=bad_thematique');

    // THEN
    expect(response.status).toBe(400);
  });

  it(`POST /utilisateurs/id/actions/id/faite - indique que l'action est faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],
      liste_actions_faites: [],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      celebrations: [],
      popup_reset_vue: false,
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      points_classement: 0,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.thematique_history.isActionFaite({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);
    expect(userDB.points_classement).toEqual(100);
    expect(userDB.gamification.getPoints()).toEqual(100);

    const compteur = await TestUtil.prisma.compteurActions.findMany();

    expect(compteur.length).toEqual(1);
    expect(compteur[0].faites).toEqual(1);
    expect(compteur[0].type_code_id).toEqual('classique_123');
  });

  it(`POST /utilisateurs/id/actions/id/faite - faire 2 fois ne raporte qu'une fois des point`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],
      liste_actions_faites: [],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      celebrations: [],
      popup_reset_vue: false,
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      points_classement: 0,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // WHEN
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.thematique_history.isActionFaite({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);
    expect(userDB.points_classement).toEqual(100);
    expect(userDB.gamification.getPoints()).toEqual(100);

    const compteur = await TestUtil.prisma.compteurActions.findMany();

    expect(compteur.length).toEqual(1);
    expect(compteur[0].faites).toEqual(1);
    expect(compteur[0].type_code_id).toEqual('classique_123');
  });
});
