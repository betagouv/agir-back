import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../repository/commune/commune.repository';

export enum CLE_PERSO {
  commune = '{COMMUNE}',
  code_postal = '{CODE_POSTAL}',
}

@Injectable()
export class Personnalisator {
  constructor(private communeRepository: CommuneRepository) {
    this.KEYS_PERSO = Object.values(CLE_PERSO);
  }

  private KEYS_PERSO: CLE_PERSO[];

  public personnaliser<T>(obj: T, utilisateur: Utilisateur): T {
    if (obj === undefined) return undefined;
    if (obj === null) return null;

    if (obj instanceof Array) {
      for (let index = 0; index < (obj as Array<any>).length; index++) {
        obj[index] = this.personnaliser(obj[index], utilisateur);
      }
      return obj;
    } else if (obj instanceof Date) {
      return obj;
    } else {
      if (typeof obj === 'string') {
        return this.personnaliserText(obj, utilisateur) as any;
      } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          obj[key] = this.personnaliser(value, utilisateur);
        }
        return obj;
      } else {
        return obj;
      }
    }
  }

  private personnaliserText(text: string, utilisateur: Utilisateur): string {
    let new_value = this.replaceLastSpaceByNBSP(text);
    for (const cle of this.KEYS_PERSO) {
      if (new_value.includes(cle)) {
        new_value = this.replace(new_value, cle, utilisateur);
      }
    }
    return new_value;
  }
  private replace(
    source: string,
    key: CLE_PERSO,
    utilisateur: Utilisateur,
  ): string {
    return source.replace(key, this.formatCle(key, utilisateur));
  }

  private replaceLastSpaceByNBSP(source: string): string {
    const length = source.length;
    if (length > 3 && source.substr(length - 2, 1) === ' ') {
      return source.substr(0, length - 2) + ' ' + source.substr(length - 1, 1); // espace inseccable
    } else {
      return source;
    }
  }

  private formatCle(cle: CLE_PERSO, utilisateur: Utilisateur): string {
    switch (cle) {
      case CLE_PERSO.commune:
        return this.formatCommune(utilisateur);
      case CLE_PERSO.code_postal:
        return utilisateur.logement.code_postal;
      default:
        return cle;
    }
  }

  private formatCommune(utilisateur: Utilisateur): string {
    return this.communeRepository.formatCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
  }
}
