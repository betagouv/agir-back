import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ActionAPI } from '../../../src/infrastructure/api/types/defis/ActionAPI';
import { CategorieRecherche } from '../../../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Thematique } from '../../../src/domain/contenu/thematique';

describe('Actions (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await actionRepository.loadActions();
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
    expect(response.body.length).toBe(1);

    const action: ActionAPI = response.body[0];

    expect(action.besoins).toEqual([]);
    expect(action.code).toEqual('The code');
    expect(action.comment).toEqual('Astuces');
    expect(action.pourquoi).toEqual('En quelques mots');
    expect(action.titre).toEqual('The titre');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.thematique).toEqual(Thematique.consommation);
    expect(action.type).toEqual(TypeAction.classique);
    expect(action.lvo_action).toEqual(CategorieRecherche.emprunter);
    expect(action.lvo_objet).toEqual('chaussure');
    expect(action.recette_categorie).toEqual(CategorieRecherche.dinde_volaille);
    expect(action.kycs).toEqual([]);
    expect(action.quizzes).toEqual([]);
    expect(action.nombre_actions_en_cours).toBeGreaterThan(0);
    expect(action.nombre_aides_disponibles).toBeGreaterThan(0);
  });
});
