import { Injectable } from '@nestjs/common';
import { KYCID } from 'src/domain/kyc/KYCID';
import { QuestionKYC } from 'src/domain/kyc/questionKYC';
import { DPE, TypeLogement } from '../domain/logement/logement';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { QuestionKYCUsecase } from './questionKYC.usecase';

const MES_AIDES_RENO_IFRAME_SIMULATION_URL =
  'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true';

@Injectable()
export class MesAidesRenoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private kycUsecase: QuestionKYCUsecase,
  ) {}

  async getIframeUrl(userId: string): Promise<string> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
      Scope.logement,
    ]);
    if (!utilisateur) {
      return MES_AIDES_RENO_IFRAME_SIMULATION_URL;
    }

    const params = this.getInputSearchParamsFor(utilisateur);

    return `${MES_AIDES_RENO_IFRAME_SIMULATION_URL}&${params.toString()}`;
  }

  async updateUtilisateurWith(
    userId: string,
    situation: Record<string, string>,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
      Scope.logement,
    ]);

    for (const [ruleName, value] of Object.entries(situation)) {
      const updated_kyc = MAPPING_MES_AIDES_RENO_TO_UPDATED_KYC[
        ruleName
      ]?.getUpdatedKyc(utilisateur, parsePublicodesValue(value));

      if (updated_kyc) {
        utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
          updated_kyc,
          utilisateur,
        );
      }
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  /**
   * Returns the search parameters to be used to prefill the questions in the
   * iframe with the already known values from the user.
   */
  private getInputSearchParamsFor(utilisateur: Utilisateur): URLSearchParams {
    const situation = {};

    if (utilisateur.logement?.proprietaire != null) {
      situation[MesAidesRenoRuleNames.logementProprietaire] =
        // NOTE: missing the case 'acquéreur'
        utilisateur.logement.proprietaire
          ? '"propriétaire"'
          : '"non propriétaire"';

      // NOTE: we assume that in the context of J'agis, the user is considered
      // as 'occupant' if he is 'proprietaire' and 'locataire'.
      if (utilisateur.logement.proprietaire) {
        situation[MesAidesRenoRuleNames.logementProprietaireOccupant] = 'oui';
        situation[
          MesAidesRenoRuleNames.logementResidencePrincipaleProprietaire
        ] = 'oui';
      }
    }

    if (utilisateur.logement?.plus_de_15_ans) {
      situation[MesAidesRenoRuleNames.logementPeriodeDeConstruction] =
        '"au moins 15 ans"';
    }

    if (
      utilisateur.logement?.dpe &&
      utilisateur.logement.dpe !== DPE.ne_sais_pas
    ) {
      switch (utilisateur.logement.dpe) {
        case DPE.A:
          situation[MesAidesRenoRuleNames.dpeActuel] = '1';
          break;
        case DPE.B:
          situation[MesAidesRenoRuleNames.dpeActuel] = '2';
          break;
        case DPE.C:
          situation[MesAidesRenoRuleNames.dpeActuel] = '3';
          break;
        case DPE.D:
          situation[MesAidesRenoRuleNames.dpeActuel] = '4';
          break;
        case DPE.E:
          situation[MesAidesRenoRuleNames.dpeActuel] = '5';
          break;
        case DPE.F:
          situation[MesAidesRenoRuleNames.dpeActuel] = '6';
          break;
        case DPE.G:
          situation[MesAidesRenoRuleNames.dpeActuel] = '7';
          break;
      }
    }

    const nb_personnes = utilisateur.getNombrePersonnesDansLogement();
    if (nb_personnes > 0) {
      situation[MesAidesRenoRuleNames.menagePersonnes] =
        nb_personnes.toString();
    }

    if (utilisateur.revenu_fiscal != null) {
      situation[MesAidesRenoRuleNames.menageRevenu] =
        utilisateur.revenu_fiscal.toString();
    }

    if (utilisateur.logement?.type) {
      switch (utilisateur.logement.type) {
        case TypeLogement.maison:
          situation[MesAidesRenoRuleNames.logementType] = '"maison"';
          break;
        case TypeLogement.appartement:
          situation[MesAidesRenoRuleNames.logementType] = '"appartement"';
          break;
      }
    }

    if (utilisateur.logement?.code_postal && utilisateur.logement?.commune) {
      const code_insee = this.communeRepository.getCommuneCodeInsee(
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

const MAPPING_MES_AIDES_RENO_TO_UPDATED_KYC: Record<
  MesAidesRenoRuleNames,
  {
    kyc: KYCID;
    getUpdatedKyc: (
      utilisateur: Utilisateur,
      value: string | number | boolean | null,
    ) => QuestionKYC | undefined;
  }
> = {
  [MesAidesRenoRuleNames.dpeActuel]: {
    kyc: KYCID.KYC_DPE,
    getUpdatedKyc: (utilisateur, value) => {
      if (Number.isSafeInteger(value)) {
        return utilisateur.kyc_history.selectChoixUniqueByCode(
          KYCID.KYC_DPE,
          getDPEFromValue(value as number),
        );
      }
    },
  },
  [MesAidesRenoRuleNames.logementCodePostal]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementCommuneCodeInsee]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementCommuneDepartement]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementCommuneNom]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementCommuneRegion]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementPeriodeDeConstruction]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementProprietaireOccupant]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementProprietaire]: {
    kyc: KYCID.KYC_proprietaire,
    getUpdatedKyc: (utilisateur, value) => {
      if (value === 'propriétaire' || value === 'non propriétaire') {
        const estProprietaire = value === 'propriétaire';
        return utilisateur.kyc_history.selectChoixUniqueByCode(
          KYCID.KYC_proprietaire,
          estProprietaire ? 'oui' : 'non',
        );
      }
    },
  },
  [MesAidesRenoRuleNames.logementResidencePrincipaleLocataire]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementResidencePrincipaleProprietaire]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementSurface]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.logementType]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menageCodeDepartement]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menageCodeEPCI]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menageCodeRegion]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menageCommune]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menagePersonnes]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
  [MesAidesRenoRuleNames.menageRevenu]: {
    kyc: KYCID._1,
    getUpdatedKyc: (utilisateur, value) => undefined,
  },
};

function getParamsFromSituation(
  situation: Record<string, string>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [ruleName, value] of Object.entries(situation)) {
    params.set(encodeDottedName(ruleName), value);
  }

  return params;
}

// Copied from https://github.com/betagouv/reno/blob/bea6cc74bd776a477141b77d78d37c330f7191f0/components/publicodes/situationUtils.ts#L3
// NOTE: why not using the publicodes utils.encodeRuleName function?
export const encodeDottedName = (decoded) => decoded.replace(/\s\.\s/g, '.');

function parsePublicodesValue(
  value: string | null,
): string | number | boolean | null {
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

/**
 * Converts a DPE value (1-7) (the format from Mes Aides Reno) to the
 * corresponding DPE enum value.
 *
 * @param value - The DPE value (1-7).
 * @returns The corresponding DPE enum value.
 * @throws Error if the value is not in the range of 1-7.
 */
function getDPEFromValue(value: number): DPE {
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
