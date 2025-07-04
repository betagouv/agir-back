import { Injectable } from '@nestjs/common';
import { App } from '../../../domain/app';
import { KYCID } from '../../../domain/kyc/KYCID';
import { Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { ApplicationError } from '../../applicationError';
import { CommuneRepository } from '../commune/commune.repository';
import {
  WinterAction,
  WinterAPIClient,
  WinterHousingData,
  WinterUsageBreakdown,
} from './winterAPIClient';

const MAPPED_KYCS: string[] = [
  KYCID.KYC_electro_refrigerateur,
  KYCID.KYC_electro_congelateur,
  KYCID.KYC_electro_petit_refrigerateur,
  KYCID.KYC_loisir_piscine_type,
  KYCID.KYC_appareil_television,
  KYCID.KYC_appareil_console_salon,
  KYCID.KYC_electro_plaques,
  KYCID.KYC_electro_lave_vaiselle,
  KYCID.KYC_electro_lave_linge,
  KYCID.KYC_electro_seche_linge,
  KYCID.KYC_chauffage,
  KYCID.KYC_chauffage_pompe_chaleur,
  KYCID.KYC_photovoltaiques,
  KYCID.KYC_transport_voiture_motorisation,
  KYCID.KYC_transport_vae_possede,
  KYCID.KYC_2roue_motorisation_type,
  KYCID.KYC_logement_age,
  KYCID.KYC_logement_reno_second_oeuvre,
];

@Injectable()
export class WinterRepository {
  constructor(
    private commune_repo: CommuneRepository,
    private winterAPIClient: WinterAPIClient,
  ) {}

  public async rechercherPRMParAdresse(
    nom: string,
    adresse: string,
    code_commune: string,
    code_postal: string,
  ): Promise<string> {
    if (App.isWinterFaked()) {
      return '12345678901234';
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    const commune = this.commune_repo.getCommuneByCodeINSEE(code_commune);
    if (!commune) {
      ApplicationError.throwCodeCommuneNotFound(code_commune);
    }

    const liste_prms = await this.winterAPIClient.searchPRM(
      nom,
      adresse,
      code_postal,
      commune.nom,
    );

    if (liste_prms.length !== 1) {
      ApplicationError.throwNoPRMFoundAtAddress(
        `${nom}, ${adresse}, ${code_postal} ${commune.nom}`,
      );
    }

    return liste_prms[0].prm;
  }

  public async inscrirePRM(
    prm: string,
    nom: string,
    user_id: string,
    ip: string,
    user_agent: string,
    version_consentement: string,
  ): Promise<void> {
    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    await this.winterAPIClient.inscrirePRM(
      prm,
      nom,
      user_id,
      ip,
      user_agent,
      version_consentement,
    );
  }

  public async putHousingData(utilisateur: Utilisateur): Promise<void> {
    if (!utilisateur.logement.prm) {
      return;
    }

    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    const data = this.generateHousingData(utilisateur);

    await this.winterAPIClient.pushHousingData(utilisateur.id, data);
  }

  public async getUsage(user_id: string): Promise<WinterUsageBreakdown> {
    if (App.isWinterFaked()) {
      return {
        yearlyElectricityTotalConsumption: [{ unit: 'eur', value: 1234567 }],
        usageBreakdown: {
          airConditioning: { eur: 130, percent: 3.8, kWh: 10 },
          heating: { eur: 1000, percent: 29.8, kWh: 20 },
          appliances: { eur: 453, percent: 13.5, kWh: 30 },
          cooking: { eur: 200, percent: 5.9, kWh: 40 },
          hotWater: { eur: 220, percent: 6.5, kWh: 1200 },
          lighting: { eur: 120, percent: 3.5, kWh: 1200 },
          mobility: { eur: 70, percent: 2.0, kWh: 1200 },
          multimedia: { eur: 42, percent: 1.2, kWh: 1200 },
          other: { eur: 987, percent: 29.5, kWh: 1200 },
          swimmingPool: { eur: 123, percent: 3.6, kWh: 1200 },
          isStatistical: false,
        },
        computingFinished: true,
        monthsOfDataAvailable: 12,
      };
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    return await this.winterAPIClient.usage(user_id);
  }

  public async supprimerPRM(user_id: string): Promise<void> {
    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    await this.winterAPIClient.supprimerPRM(user_id);
  }

  public async listerActionsWinter(user_id: string): Promise<WinterAction[]> {
    if (App.isWinterFaked()) {
      const result: WinterAction[] = [
        {
          economy: 12,
          eligibility: 'yes',
          slug: 'chauffe_eau_temperature',
          status: 'not_started',
          type: 'ecogeste',
          usage: 'appliances',
        },
      ];
      return result;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    const reponse = await this.winterAPIClient.listerActions(user_id);

    return reponse.actionStateProxyResponse;
  }

  public isAnyKycMapped(kyc_codes: string[]): boolean {
    for (const code of kyc_codes) {
      if (MAPPED_KYCS.includes(code)) {
        return true;
      }
    }
    return false;
  }

  private generateHousingData(user: Utilisateur): WinterHousingData {
    const getNumQ = (kyc: KYCID) => user.kyc_history.getQuestionNumerique(kyc);
    const getChoixU = (kyc: KYCID) =>
      user.kyc_history.getQuestionChoixUnique(kyc);

    const electro_refrigerateur = getNumQ(KYCID.KYC_electro_refrigerateur);
    const electro_congelateur = getNumQ(KYCID.KYC_electro_congelateur);
    const electro_petit_refrigerateur = getNumQ(
      KYCID.KYC_electro_petit_refrigerateur,
    );
    const loisir_piscine_type = getChoixU(KYCID.KYC_loisir_piscine_type);
    const appareil_television = getNumQ(KYCID.KYC_appareil_television);
    const appareil_console_salon = getNumQ(KYCID.KYC_appareil_console_salon);
    const electro_plaques = getNumQ(KYCID.KYC_electro_plaques);
    const electro_lave_vaiselle = getNumQ(KYCID.KYC_electro_lave_vaiselle);

    const electro_lave_linge = getNumQ(KYCID.KYC_electro_lave_linge);
    const electro_seche_linge = getNumQ(KYCID.KYC_electro_seche_linge);
    const chauffage = user.kyc_history.getQuestionChoixMultiple(
      KYCID.KYC_chauffage,
    );

    const gen_types = [];
    if (chauffage) {
      if (chauffage.isSelected('electricite'))
        gen_types.push('electric_generator');
      if (chauffage.isSelected('bois')) gen_types.push('boiler_wood');
      if (chauffage.isSelected('fioul')) gen_types.push('boiler_fuel');
      if (chauffage.isSelected('gaz')) gen_types.push('boiler_gas');
      if (chauffage.isSelected('ne_sais_pas')) gen_types.push('dont-know');
    }

    const chauffage_pompe_chaleur = getChoixU(
      KYCID.KYC_chauffage_pompe_chaleur,
    );
    const photovoltaiques = getChoixU(KYCID.KYC_photovoltaiques);
    const transport_voiture_motorisation = getChoixU(
      KYCID.KYC_transport_voiture_motorisation,
    );
    const transport_vae_possede = getChoixU(KYCID.KYC_transport_vae_possede);
    const deuxroue_motorisation_type = getChoixU(
      KYCID.KYC_2roue_motorisation_type,
    );
    const logement_age = getNumQ(KYCID.KYC_logement_age);
    const logement_reno_second_oeuvre = getChoixU(
      KYCID.KYC_logement_reno_second_oeuvre,
    );
    return {
      nbClassicRefrigerator: electro_refrigerateur?.getValue(),
      nbOneDoorRefrigerator: electro_petit_refrigerateur?.getValue(),
      nbFreezer: electro_congelateur?.getValue(),
      nbPool:
        loisir_piscine_type?.getSelectedCode() !== 'pas_piscine'
          ? 1
          : undefined,
      nbTV: appareil_television?.getValue(),
      nbConsole: appareil_console_salon?.getValue(),
      hasElectricHotPlate: electro_plaques
        ? electro_plaques.getValue() > 1
        : undefined,
      nbDishwasher: electro_lave_vaiselle?.getValue(),
      nbWashingMachine: electro_lave_linge?.getValue(),
      nbDryer: electro_seche_linge?.getValue(),
      hasElectricHeater: chauffage?.isSelected('electricite'),
      hasHeatPump: chauffage_pompe_chaleur?.getSelectedCode() === 'oui',
      nbSolarPanel:
        photovoltaiques && photovoltaiques.getSelectedCode() === 'oui'
          ? 10
          : undefined,
      nbElectricCar:
        transport_voiture_motorisation?.getSelectedCode() === 'electrique'
          ? 1
          : undefined,
      nbElectricBike:
        transport_vae_possede?.getSelectedCode() === 'oui' ? 1 : undefined,
      nbElectricScooter:
        deuxroue_motorisation_type?.getSelectedCode() === 'scoot_elec'
          ? 1
          : undefined,
      housingYear: logement_age?.getValue(),
      generatorTypes: gen_types,
      hasDoneWorks: logement_reno_second_oeuvre?.getSelectedCode() === 'oui',
      nbInhabitant: user.logement.getTailleFoyer(),
      nbAdult: user.logement.nombre_adultes,
    };
  }
}
