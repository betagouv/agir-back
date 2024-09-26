import { CategorieRecherche } from './categorieRecherche';
import { ModeDeplacement } from '../types/modeDeplacement';

export class FiltreRecherche {
  text?: string;
  categorie?: CategorieRecherche;
  point?: { latitude: number; longitude: number };
  rect_A?: { latitude: number; longitude: number };
  rect_B?: { latitude: number; longitude: number };
  code_postal?: string;
  commune?: string;
  rayon_metres?: number;
  nombre_max_resultats?: number;
  mode_deplacement?: ModeDeplacement;
  distance_metres?: number;

  constructor(filtre: FiltreRecherche) {
    Object.assign(this, filtre);
  }

  public hasPoint?() {
    return !!this.point && this.point.latitude && this.point.longitude;
  }

  public getDistanceMetresFromSearchPoint?(
    latitude: number,
    longitude: number,
  ): number {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(this.point.latitude - latitude); // deg2rad below
    var dLon = this.deg2rad(this.point.longitude - longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(latitude)) *
        Math.cos(this.deg2rad(this.point.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in metres
    return Math.round(d);
  }

  private deg2rad?(deg) {
    return deg * (Math.PI / 180);
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
