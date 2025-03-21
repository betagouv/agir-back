import { Categorie } from '../../../../src/domain/contenu/categorie';
import { DefiStatus } from '../../../../src/domain/defis/defi';
import { DefiDefinition } from '../../../../src/domain/defis/defiDefinition';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { Defi_v0 } from '../../../../src/domain/object_store/defi/defiHistory_v0';
import { Tag } from '../../../../src/domain/scoring/tag';
import { Thematique } from '../../../../src/domain/thematique/thematique';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const DEFI_1: Defi_v0 = {
  id: '1',
  points: 5,
  tags: [Tag.transport],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  status: DefiStatus.todo,
  accessible: true,
  motif: 'truc',
  categorie: Categorie.recommandation,
  mois: [1],
  conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
  sont_points_en_poche: false,
  impact_kg_co2: 5,
};
const DEFI_1_DEF: DefiDefinition = {
  content_id: '1',
  points: 5,
  tags: [Tag.transport],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  categorie: Categorie.recommandation,
  mois: [0],
  conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
  impact_kg_co2: 5,
};

describe('DefiHistory', () => {
  it('getDefisRestants :filtrage sur categorie ', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([
      {
        ...DEFI_1_DEF,
        content_id: '1',
        thematique: Thematique.climat,
        categorie: Categorie.mission,
      },
      {
        ...DEFI_1_DEF,
        content_id: '2',
        thematique: Thematique.climat,
        categorie: Categorie.recommandation,
      },
    ]);

    // THEN
    expect(
      defiHistory.getDefisRestantsByCategorieAndThematique(Categorie.mission),
    ).toHaveLength(1);
    expect(
      defiHistory.getDefisRestantsByCategorieAndThematique(Categorie.mission)[0]
        .id,
    ).toEqual('1');
  });
  it('getDefisRestants :filtrage sur thematique ', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([
      { ...DEFI_1_DEF, content_id: '1', thematique: Thematique.climat },
      { ...DEFI_1_DEF, content_id: '2', thematique: Thematique.consommation },
    ]);

    // THEN
    expect(
      defiHistory.getDefisRestantsByCategorieAndThematique(
        undefined,
        Thematique.consommation,
      ),
    ).toHaveLength(1);
    expect(
      defiHistory.getDefisRestantsByCategorieAndThematique(
        undefined,
        Thematique.consommation,
      )[0].id,
    ).toEqual('2');
  });
  it('getDefisRestants : quand hisotrique vide ', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    expect(defiHistory.getDefisRestantsByCategorieAndThematique()).toHaveLength(
      1,
    );
  });
  it('getDefisRestants : quand plus de défi', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [DEFI_1],
    });
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    expect(defiHistory.getDefisRestantsByCategorieAndThematique()).toHaveLength(
      0,
    );
  });
  it('getDefiOrException : exception si id defi inconnu', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    try {
      defiHistory.getDefiOrException('2');
      fail();
    } catch (error) {
      expect(error.code).toEqual('040');
    }
  });
  it('getDefiOrException : pas exception si id defi connu dans historique mais pas catalogue', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '123',
        },
      ],
    });
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    defiHistory.getDefiOrException('123');
    // pas d'erreur
  });
  it('updateStatus : cree defi dans hitorique pour maj status', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([DEFI_1_DEF]);

    const user = new Utilisateur();
    user.gamification = new Gamification();

    // WHEN
    defiHistory.updateStatus('1', DefiStatus.fait, user, 'toto');

    // THEN
    expect(defiHistory.getRAWDefiListe()).toHaveLength(1);
    expect(defiHistory.getRAWDefiListe()[0].getStatus()).toEqual(
      DefiStatus.fait,
    );
    expect(defiHistory.getRAWDefiListe()[0].motif).toEqual('toto');
    expect(user.gamification.getPoints()).toEqual(5);
  });
  it('updateStatus : maj status defi deja dans historique', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [DEFI_1],
    });

    const user = new Utilisateur();
    user.gamification = new Gamification();

    // WHEN
    defiHistory.updateStatus('1', DefiStatus.fait, user, 'toto');

    // THEN
    expect(defiHistory.getRAWDefiListe()[0].getStatus()).toEqual(
      DefiStatus.fait,
    );
    expect(defiHistory.getRAWDefiListe()[0].motif).toEqual('toto');
    expect(user.gamification.getPoints()).toEqual(5);
  });
  it('updateStatus : on ne gagne pas 2 fois les points', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [DEFI_1],
    });

    const user = new Utilisateur();
    user.gamification = new Gamification();

    // WHEN
    defiHistory.updateStatus('1', DefiStatus.fait, user, 'toto');
    defiHistory.updateStatus('1', DefiStatus.fait, user, 'toto');

    // THEN
    expect(defiHistory.getRAWDefiListe()[0].getStatus()).toEqual(
      DefiStatus.fait,
    );
    expect(defiHistory.getRAWDefiListe()[0].motif).toEqual('toto');
    expect(user.gamification.getPoints()).toEqual(5);
  });
  it('getDefisOfStatus : liste les défis avec status', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.todo,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.fait,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisOfStatus([DefiStatus.en_cours]);

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('2');
  });
  it('getDefisOfStatus : liste les défis avec status, seul les accessibles, filtre satut vide', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.todo,
          accessible: true,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.todo,
          accessible: false,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.todo,
          accessible: false,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisOfStatus([]);

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('1');
  });
  it('getDefisOfStatus : liste les défis avec status, seul les accessibles, filtre satut non vide', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.todo,
          accessible: true,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.todo,
          accessible: false,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.en_cours,
          accessible: true,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisOfStatus([DefiStatus.todo]);

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('1');
  });
  it('getDefisOfStatus : liste non todo et non accessible', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
          accessible: false,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisOfStatus([DefiStatus.en_cours]);

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('1');
  });
  it('getDefisOfStatus : liste non todo et non accessible, sans statut en filtre', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
          accessible: false,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisOfStatus([]);

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('1');
  });

  it('getNombreDefisRealises : donne le nombre de défis réalisés', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '4',
          status: DefiStatus.fait,
        },
      ],
    });

    // WHEN
    const nombreDefisRealises = defiHistory.getNombreDefisRealises();
    // THEN
    expect(nombreDefisRealises).toStrictEqual(3);
  });

  it('getNombreDefisAbandonnes : donne le nombre de défis abandonnés', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '4',
          status: DefiStatus.abondon,
        },
      ],
    });

    // WHEN
    const nombreDefisRealises = defiHistory.getNombreDefisAbandonnes();
    // THEN
    expect(nombreDefisRealises).toStrictEqual(2);
  });

  it('getNombreDefisDejaFait : donne le nombre de défis pas envie', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.pas_envie,
        },
        {
          ...DEFI_1,
          id: '4',
          status: DefiStatus.abondon,
        },
      ],
    });

    // WHEN
    const nombreDefisPasEnvie = defiHistory.getNombreDefisPasEnvie();
    // THEN
    expect(nombreDefisPasEnvie).toStrictEqual(1);
  });

  it('getPlusVieuxDefiEnCours : null si liste vide', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [],
    });

    // WHEN
    const defi = defiHistory.getPlusVieuxDefiEnCours();
    // THEN
    expect(defi).toBeNull();
  });
  it('getPlusVieuxDefiEnCours : null si pas de defi en cours', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.todo,
        },
      ],
    });

    // WHEN
    const defi = defiHistory.getPlusVieuxDefiEnCours();
    // THEN
    expect(defi).toBeNull();
  });
  it('getPlusVieuxDefiEnCours : plus vieux en cours ', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
          date_acceptation: new Date(100),
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.en_cours,
          date_acceptation: new Date(50),
        },
      ],
    });

    // WHEN
    const defi = defiHistory.getPlusVieuxDefiEnCours();
    // THEN
    expect(defi.id).toEqual('2');
  });
});
