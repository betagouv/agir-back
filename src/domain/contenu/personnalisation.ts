import { Utilisateur } from '../utilisateur/utilisateur';

export enum CLE_PERSO {
  commune = '{COMMUNE}',
}
export class Personnalisation {
  commune: string;

  constructor(utilisateur?: Utilisateur) {
    if (utilisateur) {
      this.commune = utilisateur.logement.commune;
    }
  }

  public personnaliser(text: string): string {
    let result = text;
    result = result.replace(
      CLE_PERSO.commune,
      this.commune ? this.formatCommune(this.commune) : CLE_PERSO.commune,
    );
    return result;
  }

  private formatCommune(commune: string): string {
    return commune
      .substr(0, 1)
      .concat(commune.substr(1, this.commune.length - 1).toLowerCase());
  }
}
