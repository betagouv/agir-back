import { CategoriesPresDeChezNous } from '../../infrastructure/repository/services_recherche/categoriesPresDeChezNous';

export class FiltreRecherche {
  point?: { latitude: number; longitude: number };
  rect_A?: { latitude: number; longitude: number };
  rect_B?: { latitude: number; longitude: number };
  code_postal?: string;
  commune?: string;
  categories_pres_de_chez_nous?: CategoriesPresDeChezNous[];

  constructor(filtre: FiltreRecherche) {
    Object.assign(this, filtre);
  }

  public computeBox?(meters: number) {
    const result = this.getBoundingBox(
      this.point.latitude,
      this.point.longitude,
      meters,
    );
    this.rect_A = result.rect_A;
    this.rect_B = result.rect_B;
  }

  private getBoundingBox?(
    pLatitude,
    pLongitude,
    pDistanceInMeters,
  ): {
    rect_A: { latitude: number; longitude: number };
    rect_B: { latitude: number; longitude: number };
  } {
    var latRadian = this.toRad(pLatitude);

    var degLatKm = 110.574235;
    var degLongKm = 110.572833 * Math.cos(latRadian);
    var deltaLat = pDistanceInMeters / 1000.0 / degLatKm;
    var deltaLong = pDistanceInMeters / 1000.0 / degLongKm;

    var topLat = pLatitude + deltaLat;
    var bottomLat = pLatitude - deltaLat;
    var leftLng = pLongitude - deltaLong;
    var rightLng = pLongitude + deltaLong;

    return {
      rect_A: {
        latitude: bottomLat,
        longitude: leftLng,
      },
      rect_B: {
        latitude: topLat,
        longitude: rightLng,
      },
    };
  }

  private toRad?(n: number) {
    return (n * Math.PI) / 180;
  }
}
