import { ApiProperty } from '@nestjs/swagger';

export class ApplicationError {
  @ApiProperty()
  code: string;
  @ApiProperty()
  message: string;
  http_status: number;

  private constructor(code: string, message: string, http_status?: number) {
    this.code = code;
    this.message = message;
    this.http_status = http_status ? http_status : 400;
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
    this.throwAppError(
      '005',
      `Mauvais code, code expiré, ou mauvaise adresse électronique`,
    );
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
  static throwNotAuthorizedEmailError() {
    this.throwAppError(
      '023',
      `La beta de ce service est pour le moment réservée aux beta-testeurs, merci de nous contacter si vous voulez en être !`,
    );
  }
  static throwSituationAlreadyExistsError(
    situationId: string,
    utilisateurId: string,
  ) {
    this.throwAppError(
      '024',
      `Une situation d'id ${situationId} existe déjà en base pour l'utilisateur ${utilisateurId}`,
    );
  }
  static throwSuiviInconnuError(type: string) {
    this.throwAppError('025', `Suivi de type ${type} inconnu`);
  }
  static throwModelCMSInconnuError(model: string) {
    this.throwAppError(
      '026',
      `Model de contenu CMS [${model}] manquant ou inconnu`,
    );
  }
  static throwAlreadySubscribedError() {
    this.throwAppError(
      '027',
      `Il y a déjà une souscription linky pour cet utilisateur`,
    );
  }
  static throwMissingPRM() {
    this.throwAppError('028', `PRM manquant`);
  }
  static throwMissingCodeDepartement() {
    this.throwAppError('029', `Code département manquant`);
  }
  static throwLinkyError(code, message) {
    this.throwAppError(code, message);
  }
  static throwQuestionInconnue(id: string) {
    this.throwAppError('030', `Question d'id ${id} inconnue`, 404);
  }
  static throwBadPRM(prm: string) {
    this.throwAppError(
      '031',
      `Mauvais format de PRM : ${prm}, nombre à 14 chiffres attendu`,
    );
  }
  static throwUnknownPRM(prm: string) {
    this.throwAppError(
      '032',
      `PRM ${prm} inconnu sur réseau le électrique, merci de corriger votre saisie.`,
    );
  }
  static throwUnknownLinkyError(prm: string, error: string) {
    this.throwAppError(
      '033',
      `Retour erreur inconnu de winter energies pour le ${prm} : ${error}`,
    );
  }
  static throwUnknownLinkyErrorWhenDelete(winter_pk: string, error: string) {
    this.throwAppError(
      '034',
      `Retour erreur inconnu de winter energies pour la suppresson du winter_pk ${winter_pk} : ${error}`,
    );
  }
  static throwArticleNotFound(content_id: string) {
    this.throwAppError(
      '035',
      `l'article d'id [${content_id}] n'existe pas`,
      404,
    );
  }
  static throwUnknownEnedisError(prm: string, code: string, message: string) {
    this.throwAppError(
      '036',
      `PRM ${prm}, code : ${code}, message : ${message}`,
    );
  }
  static throwAlreadyDeletedLinkyError(winter_pk: string) {
    this.throwAppError(
      '037',
      `Le PRM lié à la clé ${winter_pk} n'existe déjà plus`,
    );
  }

  static throwServiceNotFound(
    service_definition_id: string,
    utilisateurId: string,
  ) {
    this.throwAppError(
      '038',
      `le service [${service_definition_id}] n'est pas installé pour l'utilisateur`,
      404,
    );
  }
  static throwUnknownPRM_2(prm: string) {
    this.throwAppError(
      '039',
      `PRM ${prm} inconnu sur réseau le électrique, merci de corriger votre saisie.`,
    );
  }
  static throwUnknownLinky404() {
    this.throwAppError('040', `Service winter down avec retour 404`);
  }
  static throwDefiInconnue(id: string) {
    this.throwAppError('040', `Defi d'id ${id} inconnue`, 404);
  }
  static throwPasswordOneLowerCase() {
    this.throwAppError(
      '041',
      'Le mot de passe doit contenir au moins une minuscule',
    );
  }
  static throwPasswordUpperCase() {
    this.throwAppError(
      '042',
      'Le mot de passe doit contenir au moins une majuscule',
    );
  }
  static throwMissingResetConfirmation() {
    this.throwAppError(
      '043',
      `Taper CONFIRMATION RESET pour confirmer l'opération`,
    );
  }
  static throwPleaseReconnect() {
    this.throwAppError('044', `L'utilisateur est forcé à se reconnecter`, 401);
  }

  static throwMissionNotFound(them: string) {
    this.throwAppError(
      '045',
      `Mission de thematique [${them}] non trouvée`,
      404,
    );
  }
  static throwMissionNotFoundOfThematique(them: string) {
    this.throwAppError(
      '046',
      `Mission de thématique [${them}] non trouvée`,
      404,
    );
  }
  static throwNoMoreKYCForThematique(them: string) {
    this.throwAppError(
      '047',
      `Plus de question KYC pour la Mission de thematique [${them}]`,
      404,
    );
  }
  static throwToManyAttenteForToday() {
    this.throwAppError('048', `Liste d'attente complète pour aujourd'hui !`);
  }
  static throwBadInputsForFileAttente() {
    this.throwAppError('049', `Mauvais inputs pour la mise en file d'attente`);
  }
  static throwConcurrentUpdate() {
    this.throwAppError(
      '050',
      `l'utilisateur a été mis à jour pendant votre requête, veuillez retenter l'opération`,
    );
  }

  private static throwAppError(
    code: string,
    message: string,
    http_status?: number,
  ) {
    throw new ApplicationError(code, message, http_status);
  }
}
