import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { TestUtil } from '../../../../test/TestUtil';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { CelebrationDeNiveau } from '../../../../src/domain/gamification/celebrations/celebrationDeNiveau';
import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';

describe('Gamification', () => {
  it('ajoutePoints : ajoute bien les points ', () => {
    // GIVEN
    const gamification = new Gamification({
      points: 0,
      celebrations: [],
    });
    // WHEN
    gamification.ajoutePoints(5);

    // THEN
    expect(gamification.points).toEqual(5);
  });
  it('getNiveau : retourne niveau 1 OK', () => {
    // GIVEN
    const gamification = new Gamification(
      {
        points: 0,
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
        points: 5,
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
        points: 50,
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
        points: 50,
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
        points: 7,
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
        points: 10,
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
        points: 5,
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
        points: 7,
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
        points: 7,
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
        points: 3,
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
        points: 20,
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
    const celeb_1 = new CelebrationDeNiveau(2);
    const celeb_2 = new CelebrationDeNiveau(2);
    const celeb_3 = new CelebrationDeNiveau(2);
    const gamification = new Gamification(
      {
        points: 20,
        celebrations: [celeb_1, celeb_2, celeb_3],
      },
      [5, 15],
    );
    let utilisateur = new Utilisateur(TestUtil.utilisateurData());
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
    const celeb = new CelebrationDeNiveau(2);
    const gamification = new Gamification(
      {
        points: 20,
        celebrations: [celeb],
      },
      [5, 15],
    );
    let utilisateur = new Utilisateur(TestUtil.utilisateurData());
    utilisateur.unlocked_features = new UnlockedFeatures();
    // WHEN
    gamification.terminerCelebration(celeb.id, utilisateur);

    // THEN
    expect(gamification.celebrations).toHaveLength(0);
    expect(utilisateur.unlocked_features.getUnlockedFeatures()).toHaveLength(1);
    expect(utilisateur.unlocked_features.getUnlockedFeatures()[0]).toEqual(
      'aides',
    );
  });
});
