export class FiltreRecherche {
  categorie?: string;
  point?: { latitude: number; longitude: number };
  rect_A?: { latitude: number; longitude: number };
  rect_B?: { latitude: number; longitude: number };

  public getBoundingBox(pLatitude, pLongitude, pDistanceInMeters) {
    var latRadian = pLatitude.toRad();

    var degLatKm = 110.574235;
    var degLongKm = 110.572833 * Math.cos(latRadian);
    var deltaLat = pDistanceInMeters / 1000.0 / degLatKm;
    var deltaLong = pDistanceInMeters / 1000.0 / degLongKm;

    var topLat = pLatitude + deltaLat;
    var bottomLat = pLatitude - deltaLat;
    var leftLng = pLongitude - deltaLong;
    var rightLng = pLongitude + deltaLong;

    var northWestCoords = topLat + ',' + leftLng;
    var northEastCoords = topLat + ',' + rightLng;
    var southWestCoords = bottomLat + ',' + leftLng;
    var southEastCoords = bottomLat + ',' + rightLng;

    var boundingBox = [
      northWestCoords,
      northEastCoords,
      southWestCoords,
      southEastCoords,
    ];

    return boundingBox;
  }
}
