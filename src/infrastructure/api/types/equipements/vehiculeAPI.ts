import { ApiProperty } from '@nestjs/swagger';
import {
  Consommation100km,
  Vehicule,
  VehiculeType,
  VoitureCarburant,
  VoitureGabarit,
} from '../../../../../src/domain/equipements/vehicule';

export class VehiculeAPI {
  @ApiProperty({ required: true }) nom: string;
  @ApiProperty({ required: true, enum: VehiculeType }) type: VehiculeType;
  @ApiProperty({ required: true, enum: VoitureGabarit })
  gabarit: VoitureGabarit;
  @ApiProperty({ required: true, enum: VoitureCarburant })
  carburant: VoitureCarburant;
  @ApiProperty({ required: true, enum: Consommation100km })
  conso_100_km: Consommation100km;
  @ApiProperty({ required: true }) a_plus_de_10_ans: boolean;
  @ApiProperty({ required: true }) est_en_autopartage: boolean;

  static toDomain(data: VehiculeAPI): Vehicule {
    return new Vehicule({
      nom: data.nom,
      type: data.type,
      gabarit: data.gabarit,
      carburant: data.carburant,
      conso_100_km: data.conso_100_km,
      a_plus_de_10_ans: data.a_plus_de_10_ans,
      est_en_autopartage: data.est_en_autopartage,
    });
  }

  static toAPI(elem: Vehicule): VehiculeAPI {
    return {
      nom: elem.nom,
      type: elem.type,
      gabarit: elem.gabarit,
      carburant: elem.carburant,
      conso_100_km: elem.conso_100_km,
      a_plus_de_10_ans: elem.a_plus_de_10_ans,
      est_en_autopartage: elem.est_en_autopartage,
    };
  }
}
