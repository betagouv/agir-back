import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Aide } from '../domain/aides/aide';
import { KYCID } from '../domain/kyc/KYCID';
import { Scope } from '../domain/utilisateur/utilisateur';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';

@Injectable()
export class AdminUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async exportAides(): Promise<Aide[]> {
    const result: Aide[] = [];
    const liste = await this.aideRepository.listAll();
    for (const aide_def of liste) {
      const aide = new Aide(aide_def);

      const metropoles = new Set<string>();
      const cas = new Set<string>();
      const cus = new Set<string>();
      const ccs = new Set<string>();
      for (const code_postal of aide_def.codes_postaux) {
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'METRO')
          .map((m) => metropoles.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CA')
          .map((m) => cas.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CC')
          .map((m) => ccs.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CU')
          .map((m) => cus.add(m));
      }
      aide.ca = Array.from(cas.values());
      aide.cc = Array.from(ccs.values());
      aide.cu = Array.from(cus.values());
      aide.metropoles = Array.from(metropoles.values());
      result.push(aide);
    }
    result.sort((a, b) => parseInt(a.content_id) - parseInt(b.content_id));
    return result;
  }

  async selectUserAvecVoiture(): Promise<any> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds(
      {},
    );

    const result = [];

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, [
        Scope.kyc,
      ]);

      const reponses = {
        id: utilisateur.id,
        email: utilisateur.email,
        trajet_ma_voiture: false,
        thermique: false,
        elec: false,
        trajet_court_voit: false,
        km: 0,
        motorisation: '',
        proprio: false,
        changer_voiture: false,
      };

      const kyc_009 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC009,
      );
      const kyc_011 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC011,
      );
      const kyc_012 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC012,
      );
      const KYC_transport_voiture_km =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_voiture_km,
        );
      const KYC_transport_voiture_motorisation =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_voiture_motorisation,
        );

      const KYC_transport_type_utilisateur =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_type_utilisateur,
        );
      const KYC_changer_voiture =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_changer_voiture,
        );

      //################################

      reponses.trajet_ma_voiture =
        kyc_009?.getCodeReponseQuestionChoixUnique() === 'ma_voit';
      reponses.thermique =
        kyc_011?.getCodeReponseQuestionChoixUnique() === 'voit_therm';
      reponses.elec =
        kyc_011?.getCodeReponseQuestionChoixUnique() === 'voit_elec_hybride';
      reponses.trajet_court_voit =
        kyc_012?.getCodeReponseQuestionChoixUnique() === 'oui';
      reponses.km = KYC_transport_voiture_km?.getReponseSimpleValueAsNumber()
        ? KYC_transport_voiture_km.getReponseSimpleValueAsNumber()
        : 0;
      reponses.motorisation =
        KYC_transport_voiture_motorisation?.getCodeReponseQuestionChoixUnique();
      reponses.proprio =
        KYC_transport_type_utilisateur?.getCodeReponseQuestionChoixUnique() ===
        'proprio';
      reponses.changer_voiture =
        KYC_changer_voiture?.hasAnyResponses() &&
        KYC_changer_voiture?.getCodeReponseQuestionChoixUnique() !== 'non';

      if (
        reponses.trajet_ma_voiture ||
        reponses.thermique ||
        reponses.elec ||
        reponses.trajet_court_voit ||
        reponses.km > 0 ||
        (reponses.motorisation !== null &&
          reponses.motorisation !== undefined) ||
        reponses.proprio ||
        reponses.changer_voiture
      ) {
        if (!reponses.motorisation) {
          reponses.motorisation = null;
        }
        reponses.changer_voiture = !!reponses.changer_voiture;
        result.push(reponses);
      }
    }

    return result;
  }
}
