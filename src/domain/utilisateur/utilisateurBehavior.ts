import { RubriquePonderationSetName } from '../../../src/usecase/referentiel/ponderation';

export class UtilisateurBehavior {
  public static currentUserSystemVersion(): number {
    return Number.parseInt(process.env.USER_CURRENT_VERSION) || 0;
  }
  public static ponderationRubriques(): string {
    return (
      process.env.PONDERATION_RUBRIQUES || RubriquePonderationSetName.neutre
    );
  }
}
