import { Injectable } from '@nestjs/common';
import { KYCID } from '../domain/kyc/KYCID';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { KycToProfileSync } from '../domain/kyc/synchro/kycToProfileSync';
import { DPE, Superficie, TypeLogement } from '../domain/logement/logement';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const MES_AIDES_RENO_IFRAME_SIMULATION_URL =
  'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true';

@Injectable()
export class MesAidesRenoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
  ) {}

  /**
   * Returns the URL of the Mes Aides Reno iframe with the user's information
   * prefilled based on the user's information and KYC history.
   */
  async getIframeUrl(
    userId: string,
  ): Promise<{ iframe_url: string; iframe_url_deja_faite: string }> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
      Scope.logement,
    ]);
    if (!utilisateur) {
      return {
        iframe_url: MES_AIDES_RENO_IFRAME_SIMULATION_URL,
        iframe_url_deja_faite: MES_AIDES_RENO_IFRAME_SIMULATION_URL,
      };
    }

    const params = this.getInputSearchParamsFor(utilisateur);
    const deja_faite_params = new URLSearchParams();

    params.forEach((value, key) => {
      deja_faite_params.set(key, value + '*');
    });

    return {
      iframe_url: `${MES_AIDES_RENO_IFRAME_SIMULATION_URL}&${params.toString()}`,
      iframe_url_deja_faite: `${MES_AIDES_RENO_IFRAME_SIMULATION_URL}&${deja_faite_params.toString()}`,
    };
  }

  /**
   * Updates the user's information and KYC history based on the situation
   * provided by the Mes Aides Reno iframe.
   */
  async updateUtilisateurWith(
    userId: string,
    situation: Record<string, string>,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
      Scope.logement,
    ]);
    const normalizedSituation = Object.fromEntries(
      Object.entries(situation).map(([key, value]) => [
        key,
        parsePublicodesValue(value),
      ]),
    );

    const estLogementPrincipal =
      // The user is a tenant
      normalizedSituation[MesAidesRenoRuleNames.logementProprietaire] ===
        'non propriétaire' ||
      normalizedSituation[
        MesAidesRenoRuleNames.logementResidencePrincipaleProprietaire
      ] === true ||
      // NOTE: seems to be true if and only if the user is logementResidencePrincipaleProprietaire == 'oui'
      normalizedSituation[
        MesAidesRenoRuleNames.logementProprietaireOccupant
      ] === true;

    for (const [ruleName, value] of Object.entries(normalizedSituation)) {
      this.mappingMesAidesRenoToUpdatedKYC[ruleName]?.forEach(
        (getUpdatedKyc: UpdateQuestionKYCCallback) => {
          const updated_kyc = getUpdatedKyc(
            utilisateur,
            value,
            estLogementPrincipal,
          );

          if (updated_kyc) {
            KycToProfileSync.synchronize(updated_kyc, utilisateur);
          }
        },
      );
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  /**
   * Returns the search parameters to be used to prefill the questions in the
   * iframe with the already known values from the user.
   */
  private getInputSearchParamsFor(utilisateur: Utilisateur): URLSearchParams {
    const situation = {};

    // Automatically map the user information to the Mes Aides Reno rules.
    Object.values(MesAidesRenoRuleNames).forEach((ruleName) => {
      const value =
        this.mappingKYCToMesAidesRenoSituation[ruleName](utilisateur);

      if (value != undefined) {
        situation[ruleName] = getPublicodesValue(value);
      }
    });

    // Handle the commune and EPCI information separately, to avoid redundant
    // calls to the commune repository.
    if (
      utilisateur.code_commune ||
      (utilisateur.logement?.code_postal && utilisateur.logement?.commune)
    ) {
      const code_insee =
        utilisateur.code_commune ??
        this.communeRepository.getCommuneCodeInsee(
          utilisateur.logement.code_postal,
          utilisateur.logement.commune,
        );
      const commune = this.communeRepository.getCommuneByCodeINSEE(code_insee);
      const epci = this.communeRepository.getEPCIByCommuneCodeINSEE(code_insee);

      if (commune) {
        situation[MesAidesRenoRuleNames.menageCommune] = `"${commune.code}"`;
        situation[
          MesAidesRenoRuleNames.menageCodeRegion
        ] = `"${commune.region}"`;
        situation[
          MesAidesRenoRuleNames.menageCodeDepartement
        ] = `"${commune.departement}"`;
        situation[MesAidesRenoRuleNames.menageCodeEPCI] = `"${epci.code}"`;
        // NOTE: we assume that in the context of J'agis, the user is considered
        // as 'occupant' if he is 'proprietaire' and 'locataire'.
        situation[
          MesAidesRenoRuleNames.logementCommuneCodeInsee
        ] = `"${commune.code}"`;
        situation[
          MesAidesRenoRuleNames.logementCommuneDepartement
        ] = `"${commune.departement}"`;
        situation[
          MesAidesRenoRuleNames.logementCommuneRegion
        ] = `"${commune.region}"`;
        situation[
          MesAidesRenoRuleNames.logementCommuneNom
        ] = `"${commune.nom}"`;
        situation[
          MesAidesRenoRuleNames.logementCodePostal
        ] = `"${utilisateur.logement.code_postal}"`;
      }
    }

    return getParamsFromSituation(situation);
  }

  private mappingKYCToMesAidesRenoSituation: Record<
    MesAidesRenoRuleNames,
    GetMesAidesRenoSituationCallback
  > = {
    [MesAidesRenoRuleNames.dpeActuel]: ({ logement }) =>
      logement?.dpe && logement.dpe !== DPE.ne_sais_pas
        ? dpeToNumber(logement.dpe)
        : undefined,
    [MesAidesRenoRuleNames.logementPeriodeDeConstruction]: ({
      logement,
      kyc_history,
    }) => {
      const kyc_age = kyc_history.getQuestionNumerique(KYCID.KYC_logement_age);

      if (kyc_age && kyc_age.isAnswered()) {
        return numberToAgeLogementIntervalle(kyc_age.getValue());
      }

      return logement?.plus_de_15_ans ? 'au moins 15 ans' : undefined;
    },
    [MesAidesRenoRuleNames.logementProprietaire]: ({ logement }) =>
      // NOTE: missing the case 'acquéreur'
      logement?.proprietaire != null
        ? logement.proprietaire
          ? 'propriétaire'
          : 'non propriétaire'
        : undefined,
    // NOTE: we assume that if the user is 'proprietaire', he is also
    // 'occupant' in the context of J'agis.
    [MesAidesRenoRuleNames.logementProprietaireOccupant]: ({ logement }) =>
      logement?.proprietaire != null ? logement.proprietaire : undefined,
    [MesAidesRenoRuleNames.logementResidencePrincipaleProprietaire]: ({
      logement,
    }) => (logement?.proprietaire != null ? logement.proprietaire : undefined),
    [MesAidesRenoRuleNames.logementSurface]: ({ kyc_history, logement }) => {
      const kyc_superficie = kyc_history.getQuestionNumerique(
        KYCID.KYC_superficie,
      );
      if (kyc_superficie && kyc_superficie.isAnswered()) {
        return kyc_superficie.getValue();
      }

      return logement?.superficie != null
        ? superficieToNumber(logement.superficie)
        : undefined;
    },
    [MesAidesRenoRuleNames.logementType]: ({ logement }) =>
      logement?.type != null
        ? logement.type === TypeLogement.maison
          ? 'maison'
          : 'appartement'
        : undefined,
    [MesAidesRenoRuleNames.menagePersonnes]: (utilisateur) =>
      utilisateur.getNombrePersonnesDansLogement(),
    [MesAidesRenoRuleNames.menageRevenu]: ({ revenu_fiscal }) => revenu_fiscal,
    [MesAidesRenoRuleNames.logementResidencePrincipaleLocataire]: (_) =>
      undefined,

    // NOTE: the values are set all in one
    [MesAidesRenoRuleNames.menageCommune]: (_) => undefined,
    [MesAidesRenoRuleNames.menageCodeDepartement]: (_) => undefined,
    [MesAidesRenoRuleNames.menageCodeEPCI]: (_) => undefined,
    [MesAidesRenoRuleNames.menageCodeRegion]: (_) => undefined,
    [MesAidesRenoRuleNames.logementCommuneCodeInsee]: (_) => undefined,
    [MesAidesRenoRuleNames.logementCodePostal]: (_) => undefined,
    [MesAidesRenoRuleNames.logementCommuneDepartement]: (_) => undefined,
    [MesAidesRenoRuleNames.logementCommuneNom]: (_) => undefined,
    [MesAidesRenoRuleNames.logementCommuneRegion]: (_) => undefined,
  };

  private mappingMesAidesRenoToUpdatedKYC: Record<
    MesAidesRenoRuleNames,
    UpdateQuestionKYCCallback[]
  > = {
    [MesAidesRenoRuleNames.dpeActuel]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal && Number.isSafeInteger(value)) {
          const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
            KYCID.KYC_DPE,
          );
          kyc.selectByCode(numberToDpe(value as number));
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.logementCommuneCodeInsee]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal && typeof value === 'string') {
          const commune = this.communeRepository.getCommuneByCodeINSEE(value);
          if (commune) {
            utilisateur.code_commune = commune.code;
            utilisateur.logement.code_postal = commune.codesPostaux[0];
            utilisateur.logement.commune = commune.nom.toUpperCase();
          }
        }
        return undefined;
      },
    ],
    [MesAidesRenoRuleNames.logementPeriodeDeConstruction]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal) {
          const kyc = utilisateur.kyc_history.getQuestionNumerique(
            KYCID.KYC_logement_age,
          );
          kyc.setValue(
            ageLogementIntervalleToNumber(value as AgeLogementIntervalle),
          );
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal) {
          const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
            KYCID.KYC006,
          );
          kyc.selectByCode(
            value === 'au moins 15 ans' ? 'plus_15' : 'moins_15',
          );
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.logementProprietaireOccupant]: [],
    [MesAidesRenoRuleNames.logementProprietaire]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (
          estLogementPrincipal &&
          (value === 'propriétaire' || value === 'non propriétaire')
        ) {
          const estProprietaire = value === 'propriétaire';

          const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
            KYCID.KYC_proprietaire,
          );
          kyc.selectByCode(estProprietaire ? 'oui' : 'non');
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.logementResidencePrincipaleProprietaire]: [
      (utilisateur, value) => {
        if (value === 'oui') {
          const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
            KYCID.KYC_proprietaire,
          );
          kyc.selectByCode('oui');
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.logementSurface]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal && typeof value === 'number') {
          const kyc = utilisateur.kyc_history.getQuestionNumerique(
            KYCID.KYC_superficie,
          );
          kyc.setValue(value);
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.logementType]: [
      (utilisateur, value, estLogementPrincipal) => {
        if (estLogementPrincipal && typeof value === 'string') {
          switch (value) {
            case 'maison': {
              const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
                KYCID.KYC_type_logement,
              );
              kyc.selectByCode(TypeLogement.maison);
              utilisateur.kyc_history.updateQuestion(kyc);
              return kyc.getKyc();
            }
            case 'appartement': {
              const kyc = utilisateur.kyc_history.getQuestionChoixUnique(
                KYCID.KYC_type_logement,
              );
              kyc.selectByCode(TypeLogement.appartement);
              utilisateur.kyc_history.updateQuestion(kyc);
              return kyc.getKyc();
            }
            default: {
              throw new Error(`Unknown type of logement: ${value}`);
            }
          }
        }
      },
    ],
    [MesAidesRenoRuleNames.menageCommune]: [
      (utilisateur, value) => {
        if (typeof value === 'string') {
          const commune = this.communeRepository.getCommuneByCodeINSEE(value);
          if (commune) {
            utilisateur.code_commune = commune.code;
            utilisateur.logement.commune = commune.nom.toUpperCase();
            utilisateur.logement.code_postal = commune.codesPostaux[0];
          }
        }
        return undefined;
      },
    ],
    [MesAidesRenoRuleNames.menagePersonnes]: [
      (utilisateur, value) => {
        if (typeof value === 'number') {
          const kyc = utilisateur.kyc_history.getQuestionNumerique(
            KYCID.KYC_menage,
          );
          kyc.setValue(value);
          utilisateur.kyc_history.updateQuestion(kyc);
          return kyc.getKyc();
        }
      },
    ],
    [MesAidesRenoRuleNames.menageRevenu]: [
      (utilisateur, value) => {
        if (typeof value === 'number') {
          utilisateur.revenu_fiscal = value;
        }
        return undefined;
      },
    ],
    // The user is not the occupant of the logement.
    [MesAidesRenoRuleNames.logementResidencePrincipaleLocataire]: [],

    // We only need to get the Insee code of the commune to update the
    // utilisateur's information.
    [MesAidesRenoRuleNames.menageCodeDepartement]: [],
    [MesAidesRenoRuleNames.menageCodeEPCI]: [],
    [MesAidesRenoRuleNames.menageCodeRegion]: [],
    [MesAidesRenoRuleNames.logementCodePostal]: [],
    [MesAidesRenoRuleNames.logementCommuneDepartement]: [],
    [MesAidesRenoRuleNames.logementCommuneNom]: [],
    [MesAidesRenoRuleNames.logementCommuneRegion]: [],
  };
}

enum MesAidesRenoRuleNames {
  dpeActuel = 'DPE . actuel',
  logementCodePostal = 'logement . code postal',
  logementCommuneCodeInsee = 'logement . commune',
  logementCommuneDepartement = 'logement . commune département',
  logementCommuneNom = 'logement . commune . nom',
  logementCommuneRegion = 'logement . commune région',
  logementPeriodeDeConstruction = 'logement . période de construction',
  logementProprietaireOccupant = 'logement . propriétaire occupant',
  logementProprietaire = 'vous . propriétaire . statut',
  logementResidencePrincipaleLocataire = 'logement . résidence principale locataire',
  logementResidencePrincipaleProprietaire = 'logement . résidence principale propriétaire',
  logementSurface = 'logement . surface',
  logementType = 'logement . type',
  menageCodeDepartement = 'ménage . code département',
  menageCodeEPCI = 'ménage . EPCI',
  menageCodeRegion = 'ménage . code région',
  menageCommune = 'ménage . commune',
  menagePersonnes = 'ménage . personnes',
  menageRevenu = 'ménage . revenu',
}

type PublicodesJsValue = string | number | boolean | null;

interface UpdateQuestionKYCCallback {
  (
    utilisateur: Utilisateur,
    value: PublicodesJsValue,
    estLogementPrincipal: boolean,
  ): QuestionKYC | undefined;
}

interface GetMesAidesRenoSituationCallback {
  (utilisateur: Utilisateur): PublicodesJsValue | undefined;
}

// Copied from https://github.com/betagouv/reno/blob/bea6cc74bd776a477141b77d78d37c330f7191f0/components/publicodes/situationUtils.ts#L3
// NOTE: why not using the publicodes utils.encodeRuleName function?
export const encodeDottedName = (decoded: string) =>
  decoded.replace(/\s\.\s/g, '.');

function getParamsFromSituation(
  situation: Record<string, string>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [ruleName, value] of Object.entries(situation)) {
    params.set(encodeDottedName(ruleName), value);
  }

  return params;
}

/**
 * Parses a value from the Publicodes engine into JavaScript ones.
 *
 * @example
 * ```ts
 * parsePublicodesValue('"Hello"') // "Hello"
 * parsePublicodesValue("'Hello'") // "Hello"
 * parsePublicodesValue('42') // 42
 * parsePublicodesValue('oui') // true
 * parsePublicodesValue('non') // false
 * parsePublicodesValue('null') // null
 * parsePublicodesValue(null) // null
 * ```
 */
function parsePublicodesValue(value: string | null): PublicodesJsValue | null {
  if (!value) {
    return null;
  }
  if (value === 'oui') {
    return true;
  }
  if (value === 'non') {
    return false;
  }
  if (value === 'null') {
    return null;
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

function getPublicodesValue(value: PublicodesJsValue): string {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return value ? 'oui' : 'non';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  throw new Error(`Unknown type of value: ${typeof value}`);
}

/**
 * Converts a DPE value (1-7) (the format from Mes Aides Reno) to the
 * corresponding DPE enum value.
 *
 * @param value - The DPE value (1-7).
 * @returns The corresponding DPE enum value.
 * @throws Error if the value is not in the range of 1-7.
 */
function numberToDpe(value: number): DPE {
  switch (value) {
    case 1:
      return DPE.A;
    case 2:
      return DPE.B;
    case 3:
      return DPE.C;
    case 4:
      return DPE.D;
    case 5:
      return DPE.E;
    case 6:
      return DPE.F;
    case 7:
      return DPE.G;
    default:
      throw new Error(`Unknown DPE value: ${value}`);
  }
}

function dpeToNumber(dpe: DPE): number {
  switch (dpe) {
    case DPE.A:
      return 1;
    case DPE.B:
      return 2;
    case DPE.C:
      return 3;
    case DPE.D:
      return 4;
    case DPE.E:
      return 5;
    case DPE.F:
      return 6;
    case DPE.G:
      return 7;
    default:
      throw new Error(`Unknown DPE value: ${dpe}`);
  }
}

// FIXME: this mapping is completely arbitrary and should be confirmed
function superficieToNumber(superficie: Superficie): number {
  switch (superficie) {
    case Superficie.superficie_35:
      return 25;
    case Superficie.superficie_70:
      return 50;
    case Superficie.superficie_100:
      return 80;
    case Superficie.superficie_150:
      return 125;
    case Superficie.superficie_150_et_plus:
      return 200;
  }
}

type AgeLogementIntervalle =
  | 'moins de 2 ans'
  | 'de 2 à 10 ans'
  | 'de 10 à 15 ans'
  | 'au moins 15 ans';

function ageLogementIntervalleToNumber(age: AgeLogementIntervalle): number {
  switch (age) {
    case 'moins de 2 ans':
      return 1;
    case 'de 2 à 10 ans':
      return 5;
    case 'de 10 à 15 ans':
      return 12;
    case 'au moins 15 ans':
      return 20;
    default:
      throw new Error(`Unknown age: ${age}`);
  }
}

function numberToAgeLogementIntervalle(
  agePrecis: number,
): AgeLogementIntervalle {
  if (agePrecis < 2) {
    return 'moins de 2 ans';
  } else if (agePrecis <= 10) {
    return 'de 2 à 10 ans';
  } else if (agePrecis <= 15) {
    return 'de 10 à 15 ans';
  } else {
    return 'au moins 15 ans';
  }
}
