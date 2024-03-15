import { ApplicationError } from 'src/infrastructure/applicationError';
import { Thematique } from '../contenu/thematique';
import { Defi_v0 } from '../object_store/defi/defiHistory_v0';
import { Defi } from './defi';

export class CatalogueDefis {
  public static getAll(): Defi[] {
    const result = [];
    CatalogueDefis.defis.forEach((e) => {
      result.push(new Defi(e));
    });
    return result;
  }

  public static getTailleCatalogue(): number {
    return CatalogueDefis.defis.length;
  }

  public static getByIdOrException(id: string): Defi {
    const defi = CatalogueDefis.defis.find((element) => element.id === id);
    if (defi) {
      return new Defi(defi);
    }
    ApplicationError.throwDefiInconnue(id);
  }

  private static defis: Defi_v0[] = [
    {
      id: '001',
      points: 5,
      tags: [],
      titre:
        'Faire un trajet du quotidien à pied ou à vélo plutôt qu’en voiture ou moto 1 fois cette semaine ?',
      thematique: Thematique.transport,
    },
  ];
}
