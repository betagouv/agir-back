import { Thematique } from '../../../../src/domain/contenu/thematique';
import { DefiStatus } from '../../../../src/domain/defis/defi';
import { Tag } from '../../../../src/domain/scoring/tag';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import { Defi_v0 } from '../../../../src/domain/object_store/defi/defiHistory_v0';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { DefiDefinition } from '../../../../src/domain/defis/defiDefinition';

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
};

describe('DefiHistory', () => {
  it('getDefisRestants : quand hisotrique vide ', () => {
    // GIVEN
    const defiHistory = new DefiHistory();
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    expect(defiHistory.getDefisRestants()).toHaveLength(1);
  });
  it('getDefisRestants : quand plus de défi', () => {
    // GIVEN
    const defiHistory = new DefiHistory({
      version: 0,
      defis: [DEFI_1],
    });
    defiHistory.setCatalogue([DEFI_1_DEF]);

    // THEN
    expect(defiHistory.getDefisRestants()).toHaveLength(0);
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
    defiHistory.updateStatus('1', DefiStatus.fait, user);

    // THEN
    expect(defiHistory.defis).toHaveLength(1);
    expect(defiHistory.defis[0].getStatus()).toEqual(DefiStatus.fait);
    expect(user.gamification.points).toEqual(5);
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
    defiHistory.updateStatus('1', DefiStatus.fait, user);

    // THEN
    expect(defiHistory.defis[0].getStatus()).toEqual(DefiStatus.fait);
    expect(user.gamification.points).toEqual(5);
  });
  it('getDefisEnCours : liste les défis en cours', () => {
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
          status: DefiStatus.deja_fait,
        },
      ],
    });

    // WHEN
    const en_cours = defiHistory.getDefisEnCours();

    // THEN
    expect(en_cours).toHaveLength(1);
    expect(en_cours[0].id).toEqual('2');
  });

  it('getNombreDefisRealises', () => {
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
          status: DefiStatus.deja_fait,
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
    expect(nombreDefisRealises).toStrictEqual(2);
  });
});
