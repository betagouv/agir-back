import {
  Celebration,
  CelebrationType,
} from '../../../../src/domain/gamification/celebrations/celebration';
import { Feature } from '../../../../src/domain/gamification/feature';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

describe('Gamification', () => {
  it('ajoutePoints : ajoute bien les points ', () => {
    // GIVEN
    const gamification = new Gamification();
    const user = Utilisateur.createNewUtilisateur(
      'c',
      false,
      SourceInscription.inconnue,
    );
    // WHEN
    gamification.ajoutePoints(5, user);

    // THEN
    expect(gamification.getPoints()).toEqual(5);
    expect(user.points_classement).toEqual(5);
  });
  it('getNiveau : retourne niveau 1 OK', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 0,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const niveau = gamification.getNiveau();

    // THEN
    expect(niveau).toEqual(1);
  });
  it('getNiveau : retourne niveau 2 si pile sur seuil', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 5,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const niveau = gamification.getNiveau();

    // THEN
    expect(niveau).toEqual(2);
  });
  it('getNiveau : retourne niveau 3 si au delà du dernier seuil ', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 50,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const niveau = gamification.getNiveau();

    // THEN
    expect(niveau).toEqual(3);
  });
  it('getNiveau : retourne niveau 3 si au delà du dernier seuil ', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 50,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const niveau = gamification.getNiveau();

    // THEN
    expect(niveau).toEqual(3);
  });
  it('getNiveau : retourne niveau 2 si entre seuil 1 et 2 ', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 7,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const niveau = gamification.getNiveau();

    // THEN
    expect(niveau).toEqual(2);
  });
  it('getSeuilOfNiveau : retourne le bon seuil du niveau 3', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 10,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const seuil = gamification.getSeuilOfNiveau(3);

    // THEN
    expect(seuil).toEqual(10);
  });
  it('getCurrent_points_in_niveau : renvoie 0 si on est pile sur un niveau', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 5,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const points = gamification.getCurrent_points_in_niveau();

    // THEN
    expect(points).toEqual(0);
  });
  it('getCurrent_points_in_niveau : renvoie 2 si 2 au dela du seuil', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 7,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 10],
    );

    // WHEN
    const points = gamification.getCurrent_points_in_niveau();

    // THEN
    expect(points).toEqual(2);
  });
  it('getPoint_target_in_niveau : renvoie 10 si niv 5 puis 15', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 7,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 15],
    );

    // WHEN
    const points = gamification.getPoint_target_in_niveau();

    // THEN
    expect(points).toEqual(10);
  });
  it('getPoint_target_in_niveau : renvoie 5 si niv 5 puis 15 mais avant 5', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 3,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 15],
    );

    // WHEN
    const points = gamification.getPoint_target_in_niveau();

    // THEN
    expect(points).toEqual(5);
  });
  it('getPoint_target_in_niveau : renvoie 9999999 au dernier niveau', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        version: 0,
        points: 20,
        popup_reset_vue: false,
        celebrations: [],
      },
      [5, 15],
    );

    // WHEN
    const points = gamification.getPoint_target_in_niveau();

    // THEN
    expect(points).toEqual(999);
  });
  it('terminerCelebration : supprime correctement la bonne occurence', () => {
    // GIVEN
    const celeb_1 = new Celebration({
      id: undefined,
      titre: 'yo',
      type: CelebrationType.niveau,
      new_niveau: 2,
      reveal: Gamification.getRevealByNiveau(2),
    });
    const celeb_2 = new Celebration({
      id: undefined,
      titre: 'yo',
      type: CelebrationType.niveau,
      new_niveau: 2,
      reveal: Gamification.getRevealByNiveau(2),
    });
    const celeb_3 = new Celebration({
      id: undefined,
      titre: 'yo',
      type: CelebrationType.niveau,
      new_niveau: 2,
      reveal: Gamification.getRevealByNiveau(2),
    });
    const gamification = new Gamification(
      {
        version: 0,
        points: 20,
        popup_reset_vue: false,
        celebrations: [celeb_1, celeb_2, celeb_3],
      },
      [5, 15],
    );
    let utilisateur = new Utilisateur();
    utilisateur.unlocked_features = new UnlockedFeatures();

    // WHEN
    gamification.terminerCelebration(celeb_2.id, utilisateur);

    // THEN
    expect(gamification.celebrations).toHaveLength(2);
    expect(gamification.celebrations[0].id).toEqual(celeb_1.id);
    expect(gamification.celebrations[1].id).toEqual(celeb_3.id);
  });
  it('terminerCelebration : debloque un fonctionnalité si la celebration contient un Reveal', () => {
    // GIVEN
    const celeb = new Celebration({
      id: undefined,
      titre: 'yo',
      type: CelebrationType.niveau,
      new_niveau: 2,
      reveal: Gamification.getRevealByNiveau(2),
    });
    const gamification = new Gamification(
      {
        version: 0,
        points: 20,
        popup_reset_vue: false,
        celebrations: [celeb],
      },
      [5, 15],
    );
    let utilisateur = new Utilisateur();
    utilisateur.unlocked_features = new UnlockedFeatures();

    // WHEN
    gamification.terminerCelebration(celeb.id, utilisateur);

    // THEN
    expect(gamification.celebrations).toHaveLength(0);
    expect(utilisateur.unlocked_features.getUnlockedFeatures()).toHaveLength(1);
    expect(
      utilisateur.unlocked_features
        .getUnlockedFeatures()
        .includes(Feature.aides),
    ).toEqual(true);
  });

  it('new Gamification : popup reset pas vue par défaut pour anciens comptes', () => {
    // GIVEN
    const gamification = new Gamification({
      celebrations: [],
      points: 10,
      version: 0,
      popup_reset_vue: undefined,
    });

    // THEN
    expect(gamification.popup_reset_vue).toEqual(false);
  });
  it('createNewUtilisateur : popup reset vue par défaut ', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'c',
      false,
      SourceInscription.inconnue,
    );

    // THEN
    expect(user.gamification.popup_reset_vue).toEqual(true);
  });
});
