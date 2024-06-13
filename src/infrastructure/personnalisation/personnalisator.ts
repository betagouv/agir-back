import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../repository/commune/commune.repository';

export enum CLE_PERSO {
  commune = '{COMMUNE}',
}

@Injectable()
export class Personnalisator {
  constructor(private communeRepository: CommuneRepository) {}

  public personnaliser(obj: Object, utilisateur: Utilisateur) {
    const cles = Object.values(CLE_PERSO);

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'string') {
        for (const cle of cles) {
          if (value.includes(cle)) {
            obj[key] = value.replace(cle, this.formatCle(cle, utilisateur));
          }
        }
      }
      if (value && typeof value === 'object') {
        this.personnaliser(value, utilisateur);
      }
    }
  }

  private formatCle(cle: CLE_PERSO, utilisateur: Utilisateur): string {
    switch (cle) {
      case CLE_PERSO.commune:
        return this.formatCommune(utilisateur);
      default:
        return cle;
    }
  }

  private formatCommune(utilisateur: Utilisateur): string {
    const code_insee = this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
    const libelle =
      this.communeRepository.getLibelleCommuneLowerCase(code_insee);

    return libelle || utilisateur.logement.commune;
  }
}
