import { ApiProperty } from '@nestjs/swagger';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../../domain/logement/logement';
import { CommuneRepository } from '../../../repository/commune/commune.repository';

export class InputLogementAPI {
  @ApiProperty({ required: false }) nombre_adultes?: number;
  @ApiProperty({ required: false }) nombre_enfants?: number;
  @ApiProperty({ required: false }) code_postal?: string;
  @ApiProperty({ required: false }) code_commune?: string;
  @ApiProperty({ required: false, deprecated: true }) commune?: string;
  @ApiProperty({ required: false }) latitude?: number;
  @ApiProperty({ required: false }) longitude?: number;
  @ApiProperty({ required: false }) numero_rue?: string;
  @ApiProperty({ required: false }) rue?: string;
  @ApiProperty({ enum: TypeLogement, required: false }) type?: TypeLogement;
  @ApiProperty({ enum: Superficie, required: false }) superficie?: Superficie;
  @ApiProperty({ required: false }) proprietaire?: boolean;
  @ApiProperty({ enum: Chauffage, required: false }) chauffage?: Chauffage;
  @ApiProperty({ required: false }) plus_de_15_ans?: boolean;
  @ApiProperty({ enum: DPE, required: false }) dpe?: DPE;
}

export class LogementAPI {
  @ApiProperty({ required: false }) nombre_adultes?: number;
  @ApiProperty({ required: false }) nombre_enfants?: number;
  @ApiProperty({ required: false }) code_postal?: string;
  @ApiProperty({ required: false }) commune?: string;
  @ApiProperty({ required: false }) code_commune?: string;
  @ApiProperty({ required: false }) latitude?: number;
  @ApiProperty({ required: false }) longitude?: number;
  @ApiProperty({ required: false }) numero_rue?: string;
  @ApiProperty({ required: false }) rue?: string;
  @ApiProperty() est_prm_present?: boolean;
  @ApiProperty() est_prm_obsolete?: boolean;
  @ApiProperty() est_adresse_complete?: boolean;

  @ApiProperty({ required: false }) commune_label?: string;
  @ApiProperty({ enum: TypeLogement, required: false }) type?: TypeLogement;
  @ApiProperty({ enum: Superficie, required: false }) superficie?: Superficie;
  @ApiProperty({ required: false }) proprietaire?: boolean;
  @ApiProperty({ enum: Chauffage, required: false }) chauffage?: Chauffage;
  @ApiProperty({ required: false }) plus_de_15_ans?: boolean;
  @ApiProperty({ enum: DPE, required: false }) dpe?: DPE;

  public static mapToAPI(user: Utilisateur): LogementAPI {
    const log = user.logement;
    return {
      nombre_adultes: log.nombre_adultes,
      nombre_enfants: log.nombre_enfants,
      code_postal: log.code_postal,
      commune: CommuneRepository.getLibelleCommuneUpperCase(log.code_commune),
      rue: log.rue,
      numero_rue: log.numero_rue,
      longitude: log.longitude,
      latitude: log.latitude,
      type: log.type,
      superficie: log.superficie,
      proprietaire: log.proprietaire,
      chauffage: log.chauffage,
      plus_de_15_ans: log.plus_de_15_ans,
      dpe: log.dpe,
      commune_label: CommuneRepository.getLibelleCommuneLowerCase(
        log.code_commune,
      ),
      code_commune: log.code_commune,
      est_prm_present: !!log.prm,
      est_prm_obsolete: log.est_prm_obsolete,
      est_adresse_complete: log.possedeAdressePrecise(),
    };
  }
}
