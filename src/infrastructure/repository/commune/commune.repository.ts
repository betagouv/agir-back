import { Injectable } from '@nestjs/common';
import codes_postaux from './codes_postaux.json';

export type commune = {
  INSEE: string;
  commune: string;
  acheminement: string;
  Ligne_5: string;
};

@Injectable()
export class CommuneRepository {
  checkCodePostal(code_postal: string): boolean {
    return codes_postaux[code_postal] !== undefined;
  }

  getListCommunesParCodePostal(code_postal: string): string[] {
    const liste: commune[] = codes_postaux[code_postal];
    if (liste === undefined) return [];
    return liste.map((a) => a.commune);
  }
}
