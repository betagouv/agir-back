import { App } from '../app';
import { Badge } from './badge';
import { TypeBadge } from './typeBadge';

export class BadgeCatalogue {
  private static catalogue: Record<TypeBadge, Badge> = {
    pionnier: {
      type: TypeBadge.pionnier,
      titre: 'Pionnier',
      description: 'Présent depuis les premiers jours',
      image_url: App.getBaseURLFront() + '/badge-pionnier.webp',
    },
  };

  public static getBadge(type: TypeBadge): Badge {
    return BadgeCatalogue.catalogue[type];
  }
}
