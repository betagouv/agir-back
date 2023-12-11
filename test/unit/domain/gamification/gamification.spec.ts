import { CelebrationType } from '../../../../src/domain/gamification/celebrations/celebration';
import { Gamification } from '../../../../src/domain/gamification/gamification';

describe('Gamification', () => {
  it('ajoutePoints : ajoute bien les points ', () => {
    // GIVEN
    const gamification = new Gamification({
      points: 0,
      celebrations: [],
      reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
        reveals: [],
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
    const gamification = new Gamification(
      {
        points: 20,
        celebrations: [
          { id: '1', type: CelebrationType.niveau, titre: '1' },
          { id: '2', type: CelebrationType.niveau, titre: '2' },
          { id: '3', type: CelebrationType.niveau, titre: '3' },
        ],
        reveals: [],
      },
      [5, 15],
    );

    // WHEN
    gamification.terminerCelebration('2');

    // THEN
    expect(gamification.celebrations).toHaveLength(2);
    expect(gamification.celebrations[0].id).toEqual('1');
    expect(gamification.celebrations[1].id).toEqual('3');
  });
});
