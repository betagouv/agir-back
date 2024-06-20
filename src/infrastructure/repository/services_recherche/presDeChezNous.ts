import { Injectable } from '@nestjs/common';
import { FinderInterface } from '../../../../src/domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../../src/domain/bibliotheque_services/resultatRecherche';

@Injectable()
export class PresDeChezNous implements FinderInterface {
  public async find(text: string): Promise<ResultatRecherche[]> {
    return [
      {
        id: '1',
        titre: 'Mairie de Palaiseau',
        adresse_code_postal: '91120',
        adresse_nom_ville: 'PALAISEAU',
        adresse_rue: '91 rue de Paris',
        site_web: 'https://www.ville-palaiseau.fr/',
      },
    ];
  }
}
