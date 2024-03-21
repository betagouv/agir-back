import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Thematique } from '../contenu/thematique';
import { Defi_v0 } from '../object_store/defi/defiHistory_v0';
import { Tag } from '../scoring/tag';
import { Defi, DefiStatus } from './defi';

const CATALOGUE: Defi_v0[] = [
  {
    id: '101',
    points: 5,
    tags: [Tag.interet_transports, Tag.utilise_moto_ou_voiture],
    titre:
      'Faire un trajet du quotidien à pied ou à vélo plutôt qu’en voiture ou moto 1 fois cette semaine ?',
    thematique: Thematique.transport,
    astuces: 'astuce',
    pourquoi: 'parce que !',
    sous_titre: 'facile',
    status: DefiStatus.todo,
    date_acceptation: null,
  },
];

export class CatalogueDefis {
  private static defis_catalogue: Defi_v0[] = CATALOGUE;

  public static getAll(): Defi[] {
    const result = [];
    CatalogueDefis.defis_catalogue.forEach((e) => {
      result.push(new Defi(e));
    });
    return result;
  }

  public static getTailleCatalogue(): number {
    return CatalogueDefis.defis_catalogue.length;
  }

  public static getByIdOrException(id: string): Defi {
    const defi = CatalogueDefis.defis_catalogue.find(
      (element) => element.id === id,
    );
    if (defi) {
      return new Defi(defi);
    }
    ApplicationError.throwDefiInconnue(id);
  }

  public static setCatalogue(catalogue: Defi_v0[]) {
    CatalogueDefis.defis_catalogue = catalogue;
  }
  public static resetCatalogue() {
    CatalogueDefis.defis_catalogue = CATALOGUE;
  }
}
