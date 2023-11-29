import { Gamification } from '../../../../src/domain/gamification';

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
    expect(points).toEqual(9999999);
  });
});
