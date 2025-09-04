import validator from 'validator';
import { ApplicationError } from '../../infrastructure/applicationError';
import { CommuneRepository } from '../../infrastructure/repository/commune/commune.repository';
import { Adresse_v0 } from '../object_store/logement/logement_v0';

const CODE_COMMUNE_MAX_LENGTH = 5;
const CODE_POSTAL_MAX_LENGTH = 5;
const NUM_RUE_MAX_LENGTH = 10;
const NOM_RUE_MAX_LENGTH = 100;

export class AdresseData {
  id: string;
  date_creation: Date;
  code_commune: string;
  code_postal: string;
  numero_rue: string;
  rue: string;
  longitude: number;
  latitude: number;
}

export class Adresse extends AdresseData {
  constructor(adresse: Adresse_v0) {
    super();
    this.id = adresse.id;
    this.code_commune = adresse.code_commune;
    this.code_postal = adresse.code_postal;
    this.numero_rue = adresse.numero_rue;
    this.rue = adresse.rue;
    this.longitude = adresse.longitude;
    this.latitude = adresse.latitude;
    this.date_creation = adresse.date_creation;
  }

  public checkAllFieldsSize() {
    if (
      this.code_commune &&
      this.code_commune.length > CODE_COMMUNE_MAX_LENGTH
    ) {
      ApplicationError.throwTooBigData(
        'code_commune',
        this.code_commune,
        CODE_COMMUNE_MAX_LENGTH,
      );
    }
    if (this.code_postal && this.code_postal.length > CODE_POSTAL_MAX_LENGTH) {
      ApplicationError.throwTooBigData(
        'code_postal',
        this.code_postal,
        CODE_POSTAL_MAX_LENGTH,
      );
    }
    if (this.rue && this.rue.length > NOM_RUE_MAX_LENGTH) {
      ApplicationError.throwTooBigData('rue', this.rue, NOM_RUE_MAX_LENGTH);
    }
    if (this.numero_rue && this.numero_rue.length > NUM_RUE_MAX_LENGTH) {
      ApplicationError.throwTooBigData(
        'numero_rue',
        this.numero_rue,
        NUM_RUE_MAX_LENGTH,
      );
    }
  }
  public checkCoordinatesOK() {
    if (this.latitude) {
      if (!validator.isDecimal('' + this.latitude)) {
        ApplicationError.throwNotDecimalField('longitude', this.latitude);
      }

      if (this.latitude < -90 || this.latitude > 90) {
        ApplicationError.throwBadLatitude();
      }
    }
    if (this.longitude) {
      if (!validator.isDecimal('' + this.longitude)) {
        ApplicationError.throwNotDecimalField('longitude', this.longitude);
      }
      if (this.longitude < -180 || this.longitude > 180) {
        ApplicationError.throwBadLongitude();
      }
    }
  }
  public checkCodeCommuneOK() {
    if (!this.code_commune) {
      return;
    }
    CommuneRepository.checkCodeCommuneExists(this.code_commune);
  }

  public checkCodePostalOK() {
    if (!this.code_postal) {
      return;
    }
    CommuneRepository.checkCodePostalExists(this.code_postal);
  }

  public checkCodeCommuneAndCodePostalCoherent() {
    if (this.code_commune && this.code_postal) {
      CommuneRepository.checkCodeCommuneExists(this.code_commune);
      CommuneRepository.checkCodeCommuneEtCodePostalCoherent(
        this.code_commune,
        this.code_postal,
      );
    }
  }

  public checkAllFieldsMandatory() {
    if (!this.code_commune) {
      ApplicationError.throwMissingField('code_commune');
    }
    if (!this.code_postal) {
      ApplicationError.throwMissingField('code_postal');
    }
    if (this.latitude === null || this.latitude === undefined) {
      ApplicationError.throwMissingField('latitude');
    }
    if (this.longitude === null || this.longitude === undefined) {
      ApplicationError.throwMissingField('longitude');
    }
    if (!this.numero_rue) {
      ApplicationError.throwMissingField('numero_rue');
    }
    if (!this.rue) {
      ApplicationError.throwMissingField('rue');
    }
  }

  public checkBothCodePostalEtCodeCommuneOrNone() {
    const both_or_none =
      (!!this.code_postal && !!this.code_commune) ||
      (!this.code_postal && !this.code_commune);
    if (!both_or_none) {
      ApplicationError.throwCodePostalCommuneBothMandatory();
    }
  }

  public hasAnyAdressData(): boolean {
    return (
      !!this.numero_rue ||
      !!this.rue ||
      !!this.code_commune ||
      !!this.code_postal
    );
  }
  public hasNullifiedStreetData(): boolean {
    return this.numero_rue === null || this.rue === null;
  }
  public hasNullifiedCoordinates(): boolean {
    return this.longitude === null && this.latitude === null;
  }
  public hasAnyCoordinates(): boolean {
    return (
      this.longitude !== null &&
      this.longitude !== undefined &&
      this.latitude !== null &&
      this.latitude !== undefined
    );
  }
}
