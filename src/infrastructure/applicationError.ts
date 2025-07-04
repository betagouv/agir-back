import { ApiProperty } from '@nestjs/swagger';
import { App } from '../domain/app';

export class ApplicationError {
  @ApiProperty()
  code: string;
  @ApiProperty()
  message: string;
  http_status: number;
  @ApiProperty()
  message_tech: string;

  private constructor(
    code: string,
    message: string,
    http_status?: number,
    message_tech?: string,
  ) {
    this.code = code;
    this.message = message;
    this.http_status = http_status ? http_status : 400;
    this.message_tech = message_tech;
  }

  static throwInactiveAccountError() {
    this.throwAppError('001', 'Utilisateur non actif');
  }
  static throwForbiddenError() {
    this.throwAppError('002', 'Vous ne pouvez pas accéder à ces données');
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
    this.throwAppError('007', 'Nom obligatoire');
  }
  static throwPrenomObligatoireError() {
    this.throwAppError('008', 'Prénom obligatoire pour créer un utilisateur');
  }
  static throwEmailObligatoireError() {
    this.throwAppError(
      '009',
      'Adresse électronique obligatoire pour créer un utilisateur',
    );
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
  static throwAlreadySubscribedError(prm: string) {
    this.throwAppError(
      '027',
      `Il y a déjà une souscription linky pour le PRM ${prm}`,
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

  static throwServiceNotFound(service_definition_id: string) {
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
  static throwConcurrentUpdate() {
    this.throwAppError(
      '050',
      `l'utilisateur a été mis à jour pendant votre requête, veuillez retenter l'opération`,
    );
  }
  static throwCodePostalObligatoireError() {
    this.throwAppError(
      '051',
      'Code postal et commune obligatoires pour inscription',
    );
  }
  static throwUnkonwnSearchService(id: string) {
    this.throwAppError('052', `Service de recherche inconnu : ${id}`, 404);
  }
  static throwUnkonwnUserLocation() {
    this.throwAppError(
      '053',
      `L'utilisateur doit renseigner son code postal dans son profil pour faire une recherche de proximité, ou fournir directement des coordonnées au service`,
    );
  }
  static throwUnkonwnSearchResult(servicId: string, favId: string) {
    this.throwAppError(
      '054',
      `Pas de resultat de recherche du service [${servicId}] d'id ${favId} à mettre dans les favoris`,
      404,
    );
  }
  static throwUnkonwnCategorieForSearchService(
    servicId: string,
    categorie: string,
  ) {
    this.throwAppError(
      '055',
      `Categorie de recherche [${categorie}] non disponible pour le service [${servicId}]`,
    );
  }
  static throwUnkonwnCategorie(categorie: string) {
    this.throwAppError('056', `Categorie de recherche [${categorie}] inconnue`);
  }
  static throwEmailObligatoireMagicLinkError() {
    this.throwAppError('057', 'Adresse électronique obligatoire');
  }
  static throwCodeObligatoireMagicLinkError() {
    this.throwAppError('058', 'Code obligatoire');
  }
  static throwMagicLinkUsedError() {
    this.throwAppError(
      '059',
      `Lien de connexion déjà utilisé ou trop d'essais`,
    );
  }
  static throwMagicLinkExpiredError() {
    this.throwAppError('060', 'Lien de connexion expiré');
  }
  static throwBadCodeError() {
    this.throwAppError('061', `Mauvais code`);
  }
  static throwBadResponseValue(reponse: string, kyc_code: string) {
    this.throwAppError(
      '062',
      `Reponse [${reponse}] inconnue pour la KYC [${kyc_code}]`,
    );
  }
  static throwMissinEmail() {
    this.throwAppError('063', `Adresse électronique manquante`);
  }
  static throwMissinPassword() {
    this.throwAppError('064', `Mot de passe manquant`);
  }
  static throwBadResponseCode(question: string, kyc_code: string) {
    this.throwAppError(
      '066',
      `Pas de code ${kyc_code} disponible pour la question [${question}]`,
    );
  }

  static throwNotAlhpaNom() {
    this.throwAppError('067', `Le nom ne doit contenir que des lettres`);
  }
  static throwNotAlhpaPrenom() {
    this.throwAppError('068', `Le prénom ne doit contenir que des lettres`);
  }
  static throwBadTokenError(token: string) {
    this.throwAppError('069', `Token invalide : [${token}]`);
  }
  static throwUnknownMosaicId(id: string) {
    this.throwAppError('070', `Mosaic d'id [${id}] inconnue`, 404);
  }
  static throwExternalServiceError(service_name) {
    this.throwAppError(
      '071',
      `Le service externe '${service_name}' semble rencontrer un problème, nous vous proposons de re-essayer plus tard`,
      500,
    );
  }
  static throwMissingMosaicData() {
    this.throwAppError(
      '072',
      `Les données sont manquantes pour mettre à jour la mosaic argument, tableau de code/value attendu`,
    );
  }
  static throwRFRNotNumer() {
    this.throwAppError('073', `Le revenu fisscal doi être un nombre entier`);
  }
  static throwPartsFiscalesNotDecimal(value: string) {
    this.throwAppError(
      '074',
      `Le nombre de parts fiscales doit être un nombre décimal compris entre 0,5 et 99,5 - un seul chiffre après la virgule,  reçu : [${value}]`,
    );
  }
  static throwBadAnnee(data: number) {
    this.throwAppError(
      '075',
      `L'année de naissance [${data}] doit être un nombre entier compris entre 1900 et 2100`,
    );
  }
  static throwNbrAdultesEnfants() {
    this.throwAppError(
      '076',
      `Le nombre d'adultes et d'enfants doit être un nombre entier`,
    );
  }
  static throwCodePostalIncorrect() {
    this.throwAppError(
      '077',
      'Le code postal doit être une suite de 5 chiffres',
    );
  }
  static throwCodePostalCommuneMandatory() {
    this.throwAppError('078', 'Le code postal ET la commune sont obligatoires');
  }
  static throwBadCodePostalAndCommuneAssociation(
    code_postal: string,
    commune: string,
  ) {
    this.throwAppError(
      '079',
      `Le code postal [${code_postal}] ne correspond pas à la commune [${commune}]`,
    );
  }
  static throwUnkownEnchainement(id: string) {
    this.throwAppError('080', `L'enchainement d'id [${id}] n'existe pas`);
  }

  static throwMissingNGC_API_KEY() {
    this.throwAppError('080', `Clé API manquante (header 'apikey')`, 401);
  }
  static throwBadNGC_API_KEY(apikey: string) {
    this.throwAppError('081', `Clé API [${apikey}] incorrecte`, 403);
  }
  static throwMissingUser() {
    this.throwAppError(
      '082',
      `Cet utilisateur n'existe plus, veuillez vous reconnecter`,
      401,
    );
  }
  static throwThatURLIsGone(url: string) {
    this.throwAppError(
      '083',
      `l'URL [${url}] n'est définitivement plus disponible`,
      410,
    );
  }
  static throwThematiqueNotFound(them: string) {
    this.throwAppError('084', `Thematique [${them}] inconnue`);
  }
  static throwMissionNotFoundOfCode(code: string) {
    this.throwAppError('085', `Mission de code [${code}] non trouvée`, 404);
  }
  static throwUnsupportedSerialisationVersion(className: string) {
    this.throwAppError(
      '086',
      `Classe de serialisation non supportée : [${className}]`,
      500,
    );
  }

  static throwNoKYCResponse(code_kyc: string) {
    this.throwAppError(
      '087',
      `Aucune réponse fournie à la question [${code_kyc}]`,
    );
  }
  static throwUniqueReponseExpected(code_kyc: string) {
    this.throwAppError(
      '088',
      `Une réponse de valeur unique était attendue pour la question [${code_kyc}]`,
    );
  }
  static throwMissingValue(code_kyc: string) {
    this.throwAppError(
      '089',
      `Valeur réponse manquante pour la question [${code_kyc}]`,
    );
  }
  static throwMissingValueForCode(code_kyc: string, code: string) {
    this.throwAppError(
      '089',
      `Valeur manquante pour le code [${code}] de la question [${code_kyc}]`,
    );
  }
  static throwMissingCode(code_kyc: string) {
    this.throwAppError(
      '090',
      `Code réponse manquant pour la question [${code_kyc}]`,
    );
  }
  static throwQuestionBadCodeValue(code: string, kyc_code: string) {
    this.throwAppError(
      '091',
      `Code réponse [${code}] inconnu pour la KYC [${kyc_code}]`,
    );
  }
  static throwBadMosaicDataNumber(id: string, nbr: number) {
    this.throwAppError(
      '092',
      `le nombre de reponses attendu pour la mosaic [${id}] est de [${nbr}]`,
    );
  }
  static throwAideNotFound(content_id: string) {
    this.throwAppError('093', `l'aide d'id [${content_id}] n'existe pas`, 404);
  }
  static throwMissingSelectedAttributeForCode(code_kyc: string, code: string) {
    this.throwAppError(
      '095',
      `Attribut 'selected' manquant pour le code [${code}] de la question [${code_kyc}]`,
    );
  }

  static throwMissingValueAttributeForCode(code_kyc: string, code: string) {
    this.throwAppError(
      '096',
      `Attribut 'value' manquant pour le code [${code}] de la question [${code_kyc}]`,
    );
  }

  static throwToManySelectedAttributesForKYC(code_kyc: string, code: string) {
    this.throwAppError(
      '097',
      `Un choix unique est attendu pour la question [${code_kyc}], selection excédentaire observée pour le code [${code}]`,
    );
  }
  static throwNoneSelectedButNeededOne(code_kyc: string) {
    this.throwAppError(
      '098',
      `Un choix unique est attendu pour la question [${code_kyc}], aucune réponse selectionnée !`,
    );
  }
  static throwBadVersionDetectedForUpgrade(version: number, expected: number) {
    this.throwAppError(
      '099',
      `Mauvaise version détectée pour l'upgrade d'objet : [${version}], attendue : [${expected}]`,
      500,
    );
  }

  static throwQuizzNotFound(content_id: string) {
    this.throwAppError(
      '100',
      `le quizz d'id [${content_id}] n'existe pas`,
      404,
    );
  }
  static throwBadQuizzPourcent(pourcent: number) {
    this.throwAppError(
      '101',
      `Pourcentage attendu pour mettre un score au quizz, reçu :[${pourcent}]`,
      400,
    );
  }
  static throwTooBigData(field: string, value: string, max_length: number) {
    this.throwAppError(
      '102',
      `L'attribut [${field}] doit être de longueur maximale ${max_length}, longueur reçue : ${value.length}`,
    );
  }
  static throwConformitePageNotFound(code: string) {
    this.throwAppError(
      '103',
      `la page de conformité de code [${code}] n'existe pas`,
      404,
    );
  }
  static throwMissingPourcent() {
    this.throwAppError('104', `Attribut 'pourcent' manquant`, 400);
  }
  static throwActionNotFound(code: string, type: string) {
    this.throwAppError(
      '105',
      `l'action de code [${code}] et de type [${type}] n'existe pas`,
      404,
    );
  }
  static throwCodeCommuneNotFound(code: string) {
    this.throwAppError(
      '106',
      `le code INSEE de commune [${code}] n'existe pas`,
      404,
    );
  }
  static throwSecurityTechnicalProblemDetected(tech_reason: string) {
    this.throwAppError(
      '107',
      `Problème de sécurité détecté au cours de l'authentification`,
      400,
      tech_reason,
    );
  }
  static throwBadActionCodeFormat(code: string) {
    this.throwAppError('108', `Le code d'une action est de forme`, 404);
  }

  static throwTypeActionNotFound(type: string) {
    this.throwAppError('109', `Type d'action [${type}] inconnu`);
  }

  static throwSirenOuCodeInseeNotFound(code: string) {
    this.throwAppError(
      '110',
      `le code [${code}] ne correspond à aucun code commune INSEE ou SIREN d'EPCI`,
      404,
    );
  }
  static throwBadMosaiConfigurationError(id_mosaic: string) {
    this.throwAppError(
      '111',
      `Erreur interne de configuration de la mosaic [${id_mosaic}]`,
      500,
    );
  }
  static throwTypeConsultationNotFound(type: string) {
    this.throwAppError('112', `Type de consultation [${type}] inconnu`);
  }
  static throwCodeFranceConnectManquant() {
    this.throwAppError(
      '113',
      `Un problème est survenu pendant la connexion France Connect, veuillez ré-essayer, ou choisir un autre fournisseur d'identité sur France Connect`,
    );
  }
  static throwStateFranceConnectManquant() {
    this.throwAppError(
      '114',
      `Un problème est survenu pendant la connexion France Connect, veuillez ré-essayer, ou choisir un autre fournisseur d'identité sur France Connect`,
    );
  }
  static throwActionNotFoundById(content_id: string, type: string) {
    this.throwAppError(
      '115',
      `l'action d'id CMS [${content_id}] et de type [${type}] n'existe pas`,
      404,
    );
  }

  static throwMajImpossibleFC() {
    this.throwAppError(
      '116',
      `Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté`,
    );
  }

  static throwNotAlhpaPseudo() {
    this.throwAppError(
      '118',
      `Le pseudo ne doit contenir que des lettres ou des chiffres`,
    );
  }

  static throwBadSituationID(id: string) {
    this.throwAppError('119', `L'id de situation ${id} ne semble pas correct`);
  }
  static throwKycNoInteger(value: string) {
    this.throwAppError(
      '120',
      `L'attribut 'value' doit être de type entier, reçu : [${value}]`,
    );
  }
  static throwKycNoDecimal(value: string) {
    this.throwAppError(
      '121',
      `L'attribut 'value' doit être de type decimal, reçu : [${value}]`,
    );
  }
  static throwTypeIncludeNotFound(value: string) {
    this.throwAppError(
      '122',
      `Valeur 'include' incorrecte [${value}], sont acceptés = tout / lu / favoris`,
    );
  }

  static throwThematiqueForBilanNotAvailable(them: string) {
    this.throwAppError(
      '123',
      `Thematique [${them}] non supportée pour la calcul du bilan carbone`,
    );
  }

  static throwPreviewNotAvailable(content_id: string, type: string) {
    this.throwAppError(
      '124',
      `la preview pour pour l'objet de type [${type}] et d'id [${content_id}] n'est pas disponible`,
    );
  }
  static throwQuizzPasTermine(code: string) {
    this.throwAppError(
      '125',
      `la quizz de code [${code}] n'est pas terminable car pas terminé, il faut répondre à toutes les questions`,
    );
  }
  static throwQuizzPasTerminable(code: string) {
    this.throwAppError(
      '126',
      `la quizz de code [${code}] n'est pas terminable car score insuffisant`,
    );
  }

  static throwContentTypeNotFound(type: string) {
    this.throwAppError('127', `Content type [${type}] inconnu`);
  }

  static throwBadMonth(data: number) {
    this.throwAppError(
      '128',
      `Le mois de naissance [${data}] doit être un nombre entier compris entre 1 et 12`,
    );
  }
  static throwBadDay(data: number) {
    this.throwAppError(
      '129',
      `Le jour de naissance [${data}] doit être un nombre entier compris entre 1 et 31`,
    );
  }
  static throwErreurRapporchementCompte() {
    this.throwAppError(
      '130',
      `Un compte existant dans j'agis n'a pas pu être rapproché, erreur de connexion`,
    );
  }

  static throwTypeRealisationNotFound(type: string) {
    this.throwAppError('131', `Type de realisation [${type}] inconnu`);
  }

  static throwUserNotFound(id: string) {
    this.throwAppError('132', `L'utilisateur d'id [${id}] n'existe pas`, 404);
  }

  static throwDiffrentVersion(version: string) {
    this.throwAppError(
      '133',
      `Le back n'est pas à la même version [${App.getBackCurrentVersion()}] que celle présentée [${version}]`,
    );
  }

  static throwQuestionNotFound() {
    this.throwAppError('134', `La question n'a pas pu être identifiée`, 404);
  }

  static throwTypeExcludeNotFound(value: string) {
    this.throwAppError(
      '135',
      `Valeur 'exclude' incorrecte [${value}], sont acceptés = repondu / non_eligible`,
    );
  }
  static throwBadLikeLevel(like_level: number) {
    this.throwAppError(
      '136',
      `Les niveaux de like autorisés sont 1 - 2 - 3 - 4 , ou null, reçu [${like_level}]`,
    );
  }

  static throwBadChar(forbiden_chars: string) {
    this.throwAppError(
      '137',
      `le texte ne peut pas contenir de caractères spéciaux comme [${forbiden_chars}]`,
    );
  }

  static throwNotBoolean(attribute: string, bool: any) {
    this.throwAppError(
      '138',
      `L'attribut [${attribute}] n'est pas de type boolean, reçu [${bool}]`,
    );
  }

  static throwConnexionDown(contact: string) {
    this.throwAppError(
      '139',
      `Bonjour,
suite à un problème technique, vous ne pouvez pas vous connecter au service J'agis. Nous vous recommandons de réessayer dans quelques heures. Si le problème persiste vous pouvez joindre notre support en envoyant un mail à ${contact}`,
    );
  }

  static throwInscriptionDown(contact: string) {
    this.throwAppError(
      '140',
      `Bonjour,
suite à un problème technique, vous ne pouvez pas vous inscrire au service J'agis. Nous vous recommandons de réessayer dans quelques heures. Si le problème persiste vous pouvez joindre notre support en envoyant un mail à ${contact}`,
    );
  }

  static throwMissingQuestion() {
    this.throwAppError('141', `Attribut [question] obligatoire`);
  }

  static throwMissingLogitudeLatitude() {
    this.throwAppError(
      '142',
      `Longitude ou latitude manquante pour la recherche de score de risques naturels`,
    );
  }
  static throwErrorCallingExterneAPI(api_name: string) {
    this.throwAppError(
      '143',
      `Erreur lors de l'appel à l'API externe [${api_name}]`,
    );
  }
  static throwNotDecimalField(field: string, value) {
    this.throwAppError(
      '144',
      `Le type du champ [${field}] doit être décimal, reçu : [${value}]`,
    );
  }
  static throwSourceInscriptionInconnue(source: string) {
    this.throwAppError(
      '145',
      `La source d'inscription [${source}] est inconnue`,
    );
  }
  static throwUserMissingCommune() {
    this.throwAppError(
      '146',
      `L'utilisateur doit déclarer une commune d'habitation dans son profile logement, ou bien fournir un code commune en argument d'API`,
    );
  }
  static throwUserMissingAdresse() {
    this.throwAppError(
      '147',
      `L'utilisateur doit déclarer une adresse précise dans son profile logement, ou bien fournir des coordonnées géo à l'API`,
    );
  }
  static throwIncompleteCoordonnees() {
    this.throwAppError(
      '148',
      `Les coordonnée géographique passées en argument doivent être complète : latitude ET longitude`,
    );
  }

  static throwBadOriginParam(origin: string) {
    this.throwAppError(
      '149',
      `le paramètre 'origin' ne peut contenir que des charactères alphabétiques, reçu : [${origin}]`,
    );
  }
  static throwBadOriginLength(origin: string) {
    this.throwAppError(
      '150',
      `longueur max de 20 char pour le paramètre 'origin', reçu : [${origin.length}]`,
    );
  }

  static throwTypeOrdreNotFound(type: string) {
    this.throwAppError('151', `Type d'ordre [${type}] inconnu`);
  }

  static throwNoPRMFoundAtAddress(adresse: string) {
    this.throwAppError(
      '152',
      `Pas de PRM ou de PRM unique trouvé à cette adresse : [${adresse}]`,
      404,
    );
  }

  static throwUserMissingAdresseForPrmSearch() {
    this.throwAppError(
      '153',
      `Adresse (numéro de rue et rue) manquante pour la recherche de PRM`,
    );
  }

  static throwErrorInscriptionPRM() {
    this.throwAppError('154', `Erreur à l'inscription du PRM de l'utilisateur`);
  }

  static throwWinterDisabled() {
    this.throwAppError('155', `le service winter est désactivé`);
  }
  static throwErrorSuppressionPRM() {
    this.throwAppError(
      '156',
      `Erreur à la suppression du PRM de l'utilisateur`,
    );
  }

  static throwErrorListingWinterActions() {
    this.throwAppError('157', `Erreur à la récupération des actions Winter`);
  }

  static throwSousThematiqueNotFound(them: string) {
    this.throwAppError('158', `Sous thematique [${them}] inconnue`);
  }

  static throwOnboardingNotDone() {
    this.throwAppError(
      '159',
      `Il faut terminer l'onboarding avant de pouvoir utiliser le service`,
    );
  }

  static throwErrorAlreadyInscriptionDONE() {
    this.throwAppError(
      '160',
      `L'inscription est déjà réalisée pour cette adresse ou ce PRM`,
    );
  }

  static throwMissingPRMSouscription() {
    this.throwAppError(
      '161',
      `Pas de décomposition disponible car pas de soucription Winter (par adresse ou PRM)`,
    );
  }

  static throwCannotSkipMosaic() {
    this.throwAppError(
      '162',
      `Il n'est pas possible de passer une question de type mosaic`,
    );
  }

  static throwTagInconnu(tag: string) {
    this.throwAppError('163', `Le tag [${tag}] est inconnu`);
  }

  static throwPersonaInconnu(persona: string) {
    this.throwAppError('164', `Le persona [${persona}] est inconnu`);
  }

  private static throwAppError(
    code: string,
    message: string,
    http_status?: number,
    message_tech?: string,
  ) {
    throw new ApplicationError(code, message, http_status, message_tech);
  }
}
