import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { BlockTextRepository } from '../repository/blockText.repository';
import { CommuneRepository } from '../repository/commune/commune.repository';

export enum CLE_PERSO {
  commune = '{COMMUNE}',
  code_postal = '{CODE_POSTAL}',
  espace_insecable = 'espace_insecable',
  block_text_cms = 'block_text_cms',
}

@Injectable()
export class Personnalisator {
  constructor(private communeRepository: CommuneRepository) {
    this.KEYS_PERSO = Object.values(CLE_PERSO);
  }

  private KEYS_PERSO: CLE_PERSO[];

  public personnaliser<T>(
    obj: T,
    utilisateur: Utilisateur = null,
    disable_actions: CLE_PERSO[] = [],
  ): T {
    if (obj === undefined) return undefined;
    if (obj === null) return null;

    if (obj instanceof Array) {
      for (let index = 0; index < (obj as Array<any>).length; index++) {
        obj[index] = this.personnaliser(
          obj[index],
          utilisateur,
          disable_actions,
        );
      }
      return obj;
    } else if (obj instanceof Date) {
      return obj;
    } else {
      if (typeof obj === 'string') {
        return this.personnaliserText(obj, utilisateur, disable_actions) as any;
      } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          obj[key] = this.personnaliser(value, utilisateur, disable_actions);
        }
        return obj;
      } else {
        return obj;
      }
    }
  }

  private personnaliserText(
    text: string,
    utilisateur: Utilisateur,
    disable_actions: CLE_PERSO[] = [],
  ): string {
    let new_value = text;
    if (!disable_actions.includes(CLE_PERSO.espace_insecable)) {
      new_value = this.replaceLastSpaceByNBSP(text);
    }

    if (utilisateur) {
      for (const cle of this.KEYS_PERSO) {
        if (new_value.includes(cle) && !disable_actions.includes(cle)) {
          new_value = this.replace(new_value, cle, utilisateur);
        }
      }
    }

    if (!disable_actions.includes(CLE_PERSO.block_text_cms)) {
      new_value = this.replaceCmsBlockText(new_value);
    }

    return new_value;
  }
  private replace(
    source: string,
    key: CLE_PERSO,
    utilisateur: Utilisateur,
  ): string {
    return source.replaceAll(key, this.formatCle(key, utilisateur));
  }

  private replaceCmsBlockText(source: string): string {
    let result = source;
    for (const code of BlockTextRepository.getCodeIterator()) {
      result = result.replace(
        `{${code}}`,
        BlockTextRepository.getTexteByCode(code),
      );
    }
    return result;
  }

  private replaceLastSpaceByNBSP(source: string): string {
    const length = source.length;
    if (length > 3 && source.substring(length - 2, length - 1) === ' ') {
      return (
        source.substring(0, length - 2) +
        ' ' +
        source.substring(length - 1, length)
      ); // espace inseccable
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
