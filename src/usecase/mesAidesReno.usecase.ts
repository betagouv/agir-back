import { Injectable } from '@nestjs/common';
import { DPE, TypeLogement } from '../domain/logement/logement';
import { Scope } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class MesAidesRenoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
  ) {}

  /**
   * Returns the search parameters to be used to prefill the questions in the
   * iframe with the already known values from the user.
   */
  async getInputSearchParamsFor(userId: string): Promise<string> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
      Scope.logement,
    ]);
    if (!utilisateur) {
      return '';
    }

    console.log('utilisateur', utilisateur);

    const situation = {};

    if (utilisateur.logement?.proprietaire != null) {
      situation['vous . propriétaire . statut'] =
        // NOTE: missing the case 'acquéreur'
        utilisateur.logement.proprietaire
          ? '"propriétaire"'
          : '"non propriétaire"';

      // NOTE: we assume that in the context of J'agis, the user is considered
      // as 'occupant' if he is 'proprietaire' and 'locataire'.
      if (utilisateur.logement.proprietaire) {
        situation['logement . propriétaire occupant'] = 'oui';
        situation['logement . résidence principale propriétaire'] = 'oui';
      }
    }

    if (utilisateur.logement?.plus_de_15_ans) {
      situation['logement . période de construction'] = '"au moins 15 ans"';
    }

    if (
      utilisateur.logement?.dpe &&
      utilisateur.logement.dpe !== DPE.ne_sais_pas
    ) {
      switch (utilisateur.logement.dpe) {
        case DPE.A:
          situation['DPE . actuel'] = '1';
          break;
        case DPE.B:
          situation['DPE . actuel'] = '2';
          break;
        case DPE.C:
          situation['DPE . actuel'] = '3';
          break;
        case DPE.D:
          situation['DPE . actuel'] = '4';
          break;
        case DPE.E:
          situation['DPE . actuel'] = '5';
          break;
        case DPE.F:
          situation['DPE . actuel'] = '6';
          break;
        case DPE.G:
          situation['DPE . actuel'] = '7';
          break;
      }
    }

    const nb_personnes = utilisateur.getNombrePersonnesDansLogement();
    if (nb_personnes > 0) {
      situation['ménage . personnes'] = nb_personnes.toString();
    }

    if (utilisateur.revenu_fiscal != null) {
      situation['ménage . revenu'] = utilisateur.revenu_fiscal.toString();
    }

    if (utilisateur.logement?.type) {
      switch (utilisateur.logement.type) {
        case TypeLogement.maison:
          situation['logement . type'] = '"maison"';
          break;
        case TypeLogement.appartement:
          situation['logement . type'] = '"appartement"';
          break;
      }
    }

    if (utilisateur.logement?.code_postal && utilisateur.logement?.commune) {
      const code_insee = this.communeRepository.getCommuneCodeInsee(
        utilisateur.logement.code_postal,
        utilisateur.logement.commune,
      );
      const commune = this.communeRepository.getCommuneByCodeINSEE(code_insee);
      if (commune) {
        situation['ménage . commune'] = `"${commune.code}"`;
        situation['ménage . code région'] = `"${commune.region}"`;
        situation['ménage . code département'] = `"${commune.departement}"`;
        situation['ménage . EPCI'] = `"${commune.code}"`;
        // NOTE: we assume that in the context of J'agis, the user is considered
        // as 'occupant' if he is 'proprietaire' and 'locataire'.
        situation['logement . commune'] = commune.code;
      }
    }

    return getParamsFromSituation(situation).toString();
  }
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
