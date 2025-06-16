import { Gamification } from '../../../../src/domain/gamification/gamification';
import {
  ModeInscription,
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

describe('Gamification', () => {
  it('ajoutePoints : ajoute bien les points ', () => {
    // GIVEN
    const gamification = new Gamification();
    const user = Utilisateur.createNewUtilisateur(
      'c',
      SourceInscription.inconnue,
      ModeInscription.magic_link,
    );
    // WHEN
    gamification.ajoutePoints(5, user);

    // THEN
    expect(gamification.getPoints()).toEqual(5);
    expect(user.points_classement).toEqual(5);
  });

  it('new Gamification : popup reset pas vue par défaut pour anciens comptes', () => {
    // GIVEN
    const gamification = new Gamification({
      points: 10,
      version: 0,
      popup_reset_vue: undefined,
      badges: [],
    });

    // THEN
    expect(gamification.isPopupResetVue()).toEqual(false);
  });
  it('createNewUtilisateur : popup reset vue par défaut ', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'c',
      SourceInscription.inconnue,
      ModeInscription.magic_link,
    );

    // THEN
    expect(user.gamification.isPopupResetVue()).toEqual(true);
  });
});
