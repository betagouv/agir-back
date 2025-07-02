import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AideExport, EPCI_AIDE_EXPORT } from '../domain/aides/aideExport';
import { KYCID } from '../domain/kyc/KYCID';
import { Scope } from '../domain/utilisateur/utilisateur';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';

@Injectable()
export class AdminUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
  ) {}

  async exportAides(): Promise<AideExport[]> {
    const result: AideExport[] = [];
    const liste = await this.aideRepository.listAll();
    for (const aide_def of liste) {
      const aide = new AideExport(aide_def);
      aide.liste_partenaires = [];

      for (const part_id of aide.partenaires_supp_ids) {
        const partenaire = PartenaireRepository.getPartenaire(part_id);
        aide.liste_partenaires.push({ ...partenaire, type_epci: undefined });
      }

      for (const part of aide.liste_partenaires) {
        if (part.code_epci) {
          const EPCI = this.communeRepository.getEPCIBySIRENCode(
            part.code_epci,
          );
          if (EPCI) {
            part.type_epci = EPCI.type;
          }
        }
      }

      const liste_codes_communes = new Set<string>();
      for (const code_postal of aide_def.codes_postaux) {
        const communes =
          this.communeRepository.getCommunesForCodePostal(code_postal);
        for (const com of communes) {
          liste_codes_communes.add(this.getCommuneGlobale(com.INSEE));
        }
      }
      const liste_codes_EPCI = new Set<string>();
      aide.liste_codes_communes_hors_EPCI = [];

      for (const code_commune of liste_codes_communes) {
        const EPCI =
          this.communeRepository.getEPCIByCommuneCodeINSEE(code_commune);
        if (EPCI) {
          liste_codes_EPCI.add(EPCI.code);
        } else {
          aide.liste_codes_communes_hors_EPCI.push({
            code: code_commune,
            nom: this.communeRepository.getCommuneByCodeINSEE(code_commune).nom,
          });
        }
      }

      aide.liste_codes_communes = Array.from(liste_codes_communes.values());

      aide.liste_EPCI = [];

      for (const code_epci of liste_codes_EPCI) {
        const EPCI = this.communeRepository.getEPCIBySIRENCode(code_epci);

        const EPCI_export: EPCI_AIDE_EXPORT = {
          code_siren_epci: EPCI.code,
          nature_epci: EPCI.type,
          nom_epci: EPCI.nom,
          codes_commune_manquants: [],
          codes_commune_qui_matchent: [],
        };
        for (const membre of EPCI.membres) {
          if (!aide.liste_codes_communes.includes(membre.code)) {
            EPCI_export.codes_commune_manquants.push(membre.code);
          } else {
            EPCI_export.codes_commune_qui_matchent.push(membre.code);
          }
        }
        aide.liste_EPCI.push(EPCI_export);
      }

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

      const kyc_009 = utilisateur.kyc_history.getQuestion(KYCID.KYC009);
      const kyc_011 = utilisateur.kyc_history.getQuestion(KYCID.KYC011);
      const kyc_012 = utilisateur.kyc_history.getQuestion(KYCID.KYC012);
      const KYC_transport_voiture_km =
        utilisateur.kyc_history.getQuestionNumerique(
          KYCID.KYC_transport_voiture_km,
        );
      const KYC_transport_voiture_motorisation =
        utilisateur.kyc_history.getQuestion(
          KYCID.KYC_transport_voiture_motorisation,
        );

      const KYC_transport_type_utilisateur =
        utilisateur.kyc_history.getQuestion(
          KYCID.KYC_transport_type_utilisateur,
        );
      const KYC_changer_voiture = utilisateur.kyc_history.getQuestion(
        KYCID.KYC_changer_voiture,
      );

      //################################

      reponses.trajet_ma_voiture = kyc_009?.getSelectedCode() === 'ma_voit';
      reponses.thermique = kyc_011?.getSelectedCode() === 'voit_therm';
      reponses.elec = kyc_011?.getSelectedCode() === 'voit_elec_hybride';
      reponses.trajet_court_voit = kyc_012?.getSelectedCode() === 'oui';
      reponses.km = KYC_transport_voiture_km?.getValue()
        ? KYC_transport_voiture_km.getValue()
        : 0;
      reponses.motorisation =
        KYC_transport_voiture_motorisation?.getSelectedCode();
      reponses.proprio =
        KYC_transport_type_utilisateur?.getSelectedCode() === 'proprio';
      reponses.changer_voiture =
        KYC_changer_voiture?.is_answered &&
        KYC_changer_voiture?.getSelectedCode() !== 'non';

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

  private getCommuneGlobale(code_commune: string): string {
    const commune = this.communeRepository.getCommuneByCodeINSEE(code_commune);
    return commune.commune ? commune.commune : code_commune;
  }
}
