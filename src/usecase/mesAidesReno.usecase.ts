import { Injectable } from '@nestjs/common';
import { KYCID } from 'src/domain/kyc/KYCID';
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
      const jsValue = parsePublicodesValue(value);

      switch (ruleName) {
        case MesAidesRenoRuleNames.dpeActuel: {
          if (jsValue === 1) {
            utilisateur.logement.dpe = DPE.A;
          } else if (jsValue === 2) {
            utilisateur.logement.dpe = DPE.B;
          } else if (jsValue === 3) {
            utilisateur.logement.dpe = DPE.C;
          } else if (jsValue === 4) {
            utilisateur.logement.dpe = DPE.D;
          } else if (jsValue === 5) {
            utilisateur.logement.dpe = DPE.E;
          } else if (jsValue === 6) {
            utilisateur.logement.dpe = DPE.F;
          } else if (jsValue === 7) {
            utilisateur.logement.dpe = DPE.G;
          }

          // await this.utilisateurRepository.updateUtilisateur(utilisateur);
          break;
        }

        case MesAidesRenoRuleNames.logementCodePostal: {
          const codePostal = jsValue as string;
          // const nomCommune =  situation[MesAidesRenoRuleNames.loge&];
          break;
        }

        case MesAidesRenoRuleNames.logementProprietaire: {
          if (jsValue === 'propriétaire' || jsValue === 'non propriétaire') {
            const estProprietaire = jsValue === 'propriétaire';

            await this.kycUsecase.updateResponseKYC_v2(
              userId,
              KYCID.KYC_proprietaire,
              [
                { code: 'oui', value: 'Oui', selected: estProprietaire },
                { code: 'non', value: 'Non', selected: !estProprietaire },
              ],
            );
          }
          break;
        }

        // logementCommuneCodeInsee = 'logement . commune code insee',
        // logementCommuneDepartement = 'logement . commune département',
        // logementCommune = 'logement . commune',
        // logementCommuneRegion = 'logement . commune région',
        // logement = 'logement',
        // logementPeriodeDeConstruction = 'logement . période de construction',
        // logementProprietaireOccupant = 'logement . propriétaire occupant',
        // logementProprietaire = 'vous . propriétaire . statut',
        // logementResidencePrincipaleLocataire = 'logement . résidence principale locataire',
        // logementResidencePrincipaleProprietaire = 'logement . résidence principale propriétaire',
        // logementSurface = 'logement . surface',
        // logementType = 'logement . type',
        // menageCodeDepartement = 'ménage . code département',
        // menageCodeEPCI = 'ménage . EPCI',
        // menageCodeRegion = 'ménage . code région',
        // menageCommune = 'ménage . commune',
        // menagePersonnes = 'ménage . personnes',
        // menageRevenu = 'ménage . revenu',
      }
    }
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
