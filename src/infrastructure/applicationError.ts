import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationError {
  @ApiProperty()
  code: string;
  @ApiProperty()
  message: string;

  private constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }

  static throwBadRequestOrServerError(error) {
    if (error instanceof ApplicationError) {
      throw new BadRequestException(error);
    }
    throw new InternalServerErrorException({
      code: '000',
      message: error['message'],
    });
  }
  static throwInactiveAccountError() {
    this.throwAppError('001', 'Utilisateur non actif');
  }
  static throwForbiddenError() {
    this.throwAppError('002', 'Vous ne pouvez pas accéder à ces données');
  }
  static throwUnfinishedTodoError() {
    this.throwAppError(
      '003',
      `todo pas terminée, impossible d'encaisser les points`,
    );
  }
  static throwBadPasswordOrEmailError() {
    this.throwAppError(
      '004',
      `Mauvaise adresse électronique ou mauvais mot de passe`,
    );
  }
  static throwBadCodeOrEmailError() {
    this.throwAppError('005', `Mauvais code ou adresse électronique`);
  }
  static throwCompteDejaActifError() {
    this.throwAppError('006', `Ce compte est déjà actif`);
  }
  static throwNomObligatoireError() {
    this.throwAppError('007', 'Nom obligatoire pour créer un utilisateur');
  }
  static throwPrenomObligatoireError() {
    this.throwAppError('008', 'Prénom obligatoire pour créer un utilisateur');
  }
  static throwEmailObligatoireError() {
    this.throwAppError('009', 'Email obligatoire pour créer un utilisateur');
  }
  static throwUserGroupNotAdminError() {
    this.throwAppError('010', 'User is not admin of this group');
  }
  static throwTypeSuiviInconnuError(type) {
    this.throwAppError('011', `Unknown suivi type : ${type}`);
  }
  static throwServiceDejaInstalleError(serviceDefId) {
    this.throwAppError(
      '012',
      `Le service d'id ${serviceDefId} est dejà associé à cet utilisateur`,
    );
  }
  static throwServiceInconnuError(serviceDefId) {
    this.throwAppError('013', `Le service d'id ${serviceDefId} n'existe pas`);
  }
  static throwDonneeObligatoireOnboarding(champ) {
    this.throwAppError('014', `Valeur ${champ} obligatoire`);
  }
  static throwValeurInconnueOnboarding(nom, valeur) {
    this.throwAppError('015', `Valeur ${nom} [${valeur}] inconnue`);
  }
  static throwTropEssaisCode(jusqua) {
    this.throwAppError(
      '016',
      `Trop d'essais successifs, attendez jusqu'à ${jusqua} avant de redemander un code`,
    );
  }
  static throwTropEssaisCompteBloque(jusqua) {
    this.throwAppError(
      '017',
      `Trop d'essais successifs, compte bloqué jusqu'à ${jusqua}`,
    );
  }
  static throwPasswordCharSpe() {
    this.throwAppError(
      '018',
      'Le mot de passe doit contenir au moins un caractère spécial',
    );
  }
  static throwPassword12Char() {
    this.throwAppError(
      '018',
      'Le mot de passe doit contenir au moins 12 caractères',
    );
  }
  static throwPasswordOneDigit() {
    this.throwAppError(
      '019',
      'Le mot de passe doit contenir au moins un chiffre',
    );
  }
  static throwBaddEmailFormatError(email) {
    this.throwAppError(
      '020',
      `Format de l'adresse électronique ${email} incorrect`,
    );
  }
  static throwToManyAttemptsError(jusqua) {
    this.throwAppError(
      '021',
      `Trop d'essais successifs, attendez jusqu'à ${jusqua} pour réessayer`,
    );
  }

  static throwEmailAlreadyExistError(email) {
    this.throwAppError('022', `Adresse électronique ${email} déjà existante`);
  }

  private static throwAppError(code: string, message: string) {
    throw new ApplicationError(code, message);
  }
}
