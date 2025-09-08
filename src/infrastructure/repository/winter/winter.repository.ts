import { Injectable } from '@nestjs/common';
import { App } from '../../../domain/app';
import { KYCID } from '../../../domain/kyc/KYCID';
import { Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { ApplicationError } from '../../applicationError';
import { CommuneRepository } from '../commune/commune.repository';
import {
  WinterAction,
  WinterAPIClient,
  WinterUsageBreakdown,
} from './winterAPIClient';
import { WinterHousingData } from './winterHousingAPI';

const MAPPED_KYCS: string[] = [
  KYCID.KYC_logement_type_maison,
  KYCID.KYC_logement_type_residence,
  KYCID.KYC_logement_nbr_etages,
  KYCID.KYC_logement_etage,
  KYCID.KYC_logement_nombre_murs_exterieurs,
  KYCID.KYC_superficie,
  KYCID.KYC_chauffage_reseau,
  KYCID.KYC_proprietaire,
  KYCID.KYC_menage,
  KYCID.KYC_logement_nombre_adultes,
  KYCID.KYC_logement_tranches_age,
  KYCID.KYC_logement_age,
  KYCID.KYC_logement_murs_commun,
  KYCID.KYC_logement_reno_second_oeuvre,
  KYCID.KYC_logement_combles_amenages,
  KYCID.KYC_logement_isolation_murs,
  KYCID.KYC_logement_vitrage,
  KYCID.KYC_logement_vmc,
  KYCID.KYC_logement_chauffage_principal,
  KYCID.KYC_logement_chauffage_secondaire,
  KYCID.KYC_chauffage_installation_date,
  KYCID.KYC_type_chauffage_eau,
  KYCID.KYC_chauffage_pompe_chaleur,
  KYCID.KYC_chauffage_pompe_chaleur_type,
  KYCID.KYC_chauffage_stockage_eau_chaude,
  KYCID.KYC_electro_petit_refrigerateur,
  KYCID.KYC_electro_refrigerateur,
  KYCID.KYC_logement_frigo_americain,
  KYCID.KYC_electro_congelateur,
  KYCID.KYC_electro_cave_a_vin,
  KYCID.KYC_electro_four_elec,
  KYCID.KYC_electro_four_gaz,
  KYCID.KYC_electro_four_externe,
  KYCID.KYC_electro_plaques_gaz,
  KYCID.KYC_electro_plaques,
  KYCID.KYC_appareil_television,
  KYCID.KYC_appareil_console_salon,
  KYCID.KYC_appareil_box_internet,
  KYCID.KYC_electro_lave_vaiselle,
  KYCID.KYC_electro_lave_linge,
  KYCID.KYC_electro_seche_linge,
  KYCID.KYC_transport_nbr_voitures_elec,
  KYCID.KYC_transport_nbr_velo_elec,
  KYCID.KYC_transport_nbr_scooter_elec,
  KYCID.KYC_loisir_piscine_type,
  KYCID.KYC_electro_climatiseur_mobile,
  KYCID.KYC_electro_bouilloire,
  KYCID.KYC_photovoltaiques,
  KYCID.KYC_elec_nbr_panneaux_solaires,
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

    const commune =
      this.commune_repo.getCommuneByCodeINSEESansArrondissement(code_commune);
    if (!commune) {
      ApplicationError.throwCodeCommuneNotFound(code_commune);
    }

    const liste_prms = await this.winterAPIClient.searchPRM(
      nom,
      adresse,
      code_postal,
      commune.nom,
    );

    if (liste_prms.length === 0) {
      ApplicationError.throwNoPRMFoundAtAddress(
        `${nom}, ${adresse}, ${code_postal} ${commune.nom}`,
      );
    }
    if (liste_prms.length > 1) {
      ApplicationError.throwNoUniquePRMFoundAtAddress(
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

    const data = this.generateHousingData(utilisateur);
    console.log(JSON.stringify(data));

    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    await this.winterAPIClient.pushHousingData(utilisateur.id, data);
  }

  public async getUsage(user_id: string): Promise<WinterUsageBreakdown> {
    if (App.isWinterFaked()) {
      return {
        yearlyElectricityTotalConsumption: [
          { unit: '€', value: 1234 },
          { unit: 'kWh', value: 3690 },
        ],
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
          slug: 'regler-temperature-chauffe-eau',
          status: 'not_started',
          type: 'ecogeste',
          usage: 'appliances',
        },
        {
          economy: 57,
          eligibility: 'yes',
          slug: 'mettre-couvercle-cuisson',
          status: 'not_started',
          type: 'ecogeste',
          usage: 'appliances',
        },
        {
          economy: 200,
          eligibility: 'yes',
          slug: 'eteindre-box-internet',
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
    const getChoixM = (kyc: KYCID) =>
      user.kyc_history.getQuestionChoixMultiple(kyc);

    const electro_refrigerateur = getNumQ(KYCID.KYC_electro_refrigerateur);
    const electro_congelateur = getNumQ(KYCID.KYC_electro_congelateur);
    const electro_cave_vin = getNumQ(KYCID.KYC_electro_cave_a_vin);
    const electro_petit_refrigerateur = getNumQ(
      KYCID.KYC_electro_petit_refrigerateur,
    );
    const logement_frigo_americain = getNumQ(
      KYCID.KYC_logement_frigo_americain,
    );
    const loisir_piscine_type = getChoixU(KYCID.KYC_loisir_piscine_type);
    const appareil_television = getNumQ(KYCID.KYC_appareil_television);
    const appareil_console_salon = getNumQ(KYCID.KYC_appareil_console_salon);
    const nbr_panneaux_solaires = getNumQ(KYCID.KYC_elec_nbr_panneaux_solaires);
    const box_internet = getNumQ(KYCID.KYC_appareil_box_internet);
    const electro_plaques = getNumQ(KYCID.KYC_electro_plaques);
    const electro_cuiseur_elec = getChoixU(KYCID.KYC_electro_cuiseur_elec);
    const electro_four_elec = getChoixU(KYCID.KYC_electro_four_elec);
    const electro_four_gaz = getChoixU(KYCID.KYC_electro_four_gaz);
    const electro_four_externe = getChoixU(KYCID.KYC_electro_four_gaz);
    const electro_plaques_gaz = getChoixU(KYCID.KYC_electro_plaques_gaz);
    const combles_amenage_value = getChoixU(
      KYCID.KYC_logement_combles_amenages,
    );
    const isolation_murs_value = getChoixU(KYCID.KYC_logement_isolation_murs);
    const vitrage_value = getChoixU(KYCID.KYC_logement_vitrage);
    const vmc_value = getChoixU(KYCID.KYC_logement_vmc);
    const stockage_eau_chaude = getChoixU(
      KYCID.KYC_chauffage_stockage_eau_chaude,
    );
    const electro_lave_vaiselle = getNumQ(KYCID.KYC_electro_lave_vaiselle);

    const electro_lave_linge = getNumQ(KYCID.KYC_electro_lave_linge);
    const electro_seche_linge = getNumQ(KYCID.KYC_electro_seche_linge);
    const electro_climatiseur_mobile = getNumQ(
      KYCID.KYC_electro_climatiseur_mobile,
    );
    const chauffage = getChoixU(KYCID.KYC_logement_chauffage_principal);
    const type_residence = getChoixU(KYCID.KYC_logement_type_residence);

    const chauffage_secondaire = getChoixM(
      KYCID.KYC_logement_chauffage_secondaire,
    );
    const type_pompe_chaleur = getChoixU(
      KYCID.KYC_chauffage_pompe_chaleur_type,
    );
    const type_etage_logement = getChoixU(KYCID.KYC_logement_etage);

    const chauffage_reseau = getChoixU(KYCID.KYC_chauffage_reseau);
    const chauffage_eau = getChoixU(KYCID.KYC_type_chauffage_eau);
    const epoque_chauffage_value = getChoixU(
      KYCID.KYC_chauffage_installation_date,
    );

    const tranche_age_values = getChoixM(KYCID.KYC_type_chauffage_eau);
    let tranches_ages: ('0-18' | '18-60' | '60+')[] = [];
    if (tranche_age_values.isSelected('age_0_18')) tranches_ages.push('0-18');
    if (tranche_age_values.isSelected('age_18_60')) tranches_ages.push('18-60');
    if (tranche_age_values.isSelected('age_60_plus')) tranches_ages.push('60+');

    let hot_water_type = 'dont-know';
    if (chauffage_eau.isSelected('chauffe_eau_elec'))
      hot_water_type = 'electric_water_heater';
    if (chauffage_eau.isSelected('chauffe_eau_elec_thermo'))
      hot_water_type = 'electric_water_heater_thermodynamic';
    if (chauffage_eau.isSelected('pompe_chaleur')) hot_water_type = 'heat_pump';
    if (chauffage_eau.isSelected('chaudiere_gaz'))
      hot_water_type = 'boiler_gaz';
    if (chauffage_eau.isSelected('chaudiere_fioul'))
      hot_water_type = 'boiler_fuel';
    if (chauffage_eau.isSelected('urbaine_ou_biomasse'))
      hot_water_type = 'urban_heating_or_biomass';
    if (chauffage_eau.isSelected('ne_sais_pas')) hot_water_type = 'dont-know';

    const gen_types = [];
    if (chauffage_secondaire.isSelected('rad_elec')) gen_types.push('electric');
    if (chauffage_secondaire.isSelected('pompe_chaleur'))
      gen_types.push('heat_pump');
    if (chauffage_secondaire.isSelected('bois')) gen_types.push('boiler_wood');
    if (chauffage_secondaire.isSelected('fioul')) gen_types.push('boiler_fuel');
    if (chauffage_secondaire.isSelected('chaudiere_gaz'))
      gen_types.push('boiler_gas');
    if (chauffage_secondaire.isSelected('ne_sais_pas'))
      gen_types.push('dont-know');
    if (chauffage_secondaire.isSelected('autres')) gen_types.push('other');

    let main_chauffage:
      | 'boiler_gas'
      | 'boiler_wood'
      | 'boiler_fuel'
      | 'electric'
      | 'other'
      | 'dont-know'
      | 'heat_pump' = 'dont-know';
    if (chauffage.isSelected('rad_elec')) main_chauffage = 'electric';
    if (chauffage.isSelected('pompe_chaleur')) main_chauffage = 'heat_pump';
    if (chauffage.isSelected('chaudiere_gaz')) main_chauffage = 'boiler_gas';
    if (chauffage.isSelected('bois')) main_chauffage = 'boiler_wood';
    if (chauffage.isSelected('fioul')) main_chauffage = 'boiler_fuel';
    if (chauffage.isSelected('autres')) main_chauffage = 'other';

    let type_pompe_chaleur_value: 'air-air' | 'air-water' | 'geotermal';
    if (type_pompe_chaleur.isSelected('air_air')) {
      type_pompe_chaleur_value = 'air-air';
    }
    if (type_pompe_chaleur.isSelected('air_eau')) {
      type_pompe_chaleur_value = 'air-water';
    }
    if (type_pompe_chaleur.isSelected('geothermique')) {
      type_pompe_chaleur_value = 'geotermal';
    }

    let type_etage: 'ground' | 'intermediate' | 'last';
    if (type_etage_logement.isSelected('rez_chaussee')) {
      type_etage = 'ground';
    }
    if (type_etage_logement.isSelected('intermediaire')) {
      type_etage = 'intermediate';
    }
    if (type_etage_logement.isSelected('dernier_etage')) {
      type_etage = 'last';
    }

    let combles: 'converted_attics' | 'attics';
    if (combles_amenage_value.isSelected('oui')) {
      combles = 'converted_attics';
    }
    if (combles_amenage_value.isSelected('non')) {
      combles = 'attics';
    }

    let vitrage: 'middle_class' | 'high_class';
    if (vitrage_value.isSelected('simple_vitrage')) {
      vitrage = 'middle_class';
    }
    if (vitrage_value.isSelected('double_vitrage')) {
      vitrage = 'high_class';
    }

    let isolation_murs: 'walls_outside' | 'walls_inside';
    if (isolation_murs_value.isSelected('exterieur')) {
      isolation_murs = 'walls_outside';
    }
    if (isolation_murs_value.isSelected('interieur')) {
      isolation_murs = 'walls_inside';
    }

    let vmc: 'simple_vmc' | 'double_vmc';
    if (vmc_value.isSelected('simple')) {
      vmc = 'simple_vmc';
    }
    if (vmc_value.isSelected('double')) {
      vmc = 'double_vmc';
    }

    let epoque_chauffage: 'before-2010' | 'after-2010' | 'dont-know';
    if (epoque_chauffage_value.isSelected('avant_2010')) {
      epoque_chauffage = 'before-2010';
    }
    if (epoque_chauffage_value.isSelected('apres_2010')) {
      epoque_chauffage = 'after-2010';
    }
    if (epoque_chauffage_value.isSelected('ne_sais_pas')) {
      epoque_chauffage = 'dont-know';
    }

    if (gen_types.length === 0) {
      gen_types.push('dont-know');
    }

    const chauffage_pompe_chaleur = getChoixU(
      KYCID.KYC_chauffage_pompe_chaleur,
    );
    const bouilloire_elec = getNumQ(KYCID.KYC_electro_bouilloire);
    const transport_nbr_voitures_elec = getNumQ(
      KYCID.KYC_transport_nbr_voitures_elec,
    );
    const transport_nbr_velo_elec = getNumQ(KYCID.KYC_transport_nbr_velo_elec);
    const transport_nbr_scooter_elec = getNumQ(
      KYCID.KYC_transport_nbr_scooter_elec,
    );
    const logement_age = getNumQ(KYCID.KYC_logement_age);

    let fourchette_annee_logement = 'unknown';
    if (logement_age.getValue()) {
      const annee_logement = new Date().getFullYear() - logement_age.getValue();
      if (annee_logement > 2021) {
        fourchette_annee_logement = 'after_21';
      }
      if (annee_logement >= 2012) {
        fourchette_annee_logement = '12-21';
      }
      if (annee_logement >= 1989) {
        fourchette_annee_logement = '89-11';
      }
      if (annee_logement >= 1949) {
        fourchette_annee_logement = '49-88';
      }
      if (annee_logement < 1949) {
        fourchette_annee_logement = 'before_48';
      }
    }

    const logement_proprio = getChoixU(KYCID.KYC_proprietaire);
    const logement_type = getChoixU(KYCID.KYC_logement_type_maison);
    const murs_communs = getChoixU(KYCID.KYC_logement_murs_commun);
    const logement_superficie = getNumQ(KYCID.KYC_superficie);
    const nombre_niveaux = getNumQ(KYCID.KYC_logement_nbr_etages);
    const nombre_murs_exterieurs = getNumQ(
      KYCID.KYC_logement_nombre_murs_exterieurs,
    );

    const logement_habitants = getNumQ(KYCID.KYC_menage);

    const logement_reno_second_oeuvre = getChoixU(
      KYCID.KYC_logement_reno_second_oeuvre,
    );

    let type_maison: 'terraced-house' | 'house' | 'apartment' | 'office';
    if (logement_type.isSelected('maison')) {
      type_maison = 'house';
    }
    if (logement_type.isSelected('maison_mitoyenne')) {
      type_maison = 'terraced-house';
    }
    if (logement_type.isSelected('appartement')) {
      type_maison = 'apartment';
    }
    if (logement_type.isSelected('bureaux')) {
      type_maison = 'office';
    }

    return {
      nbClassicRefrigerator: electro_refrigerateur?.getValue(),
      nbOneDoorRefrigerator: electro_petit_refrigerateur?.getValue(),
      nbAmericanRefrigerator: logement_frigo_americain?.getValue(),
      nbFreezer: electro_congelateur?.getValue(),

      nbWineCave: electro_cave_vin?.getValue(),
      nbPool:
        loisir_piscine_type.getSelectedCode() === undefined ||
        loisir_piscine_type.getSelectedCode() === 'pas_piscine'
          ? 0
          : 1,
      nbTV: appareil_television?.getValue(),
      nbConsole: appareil_console_salon?.getValue(),
      nbInternetBox: box_internet?.getValue(),
      hasElectricHotPlate: electro_plaques
        ? electro_plaques.getValue() > 1
        : undefined,
      hasElectricWaterHeater: bouilloire_elec
        ? bouilloire_elec.getValue() > 1
        : undefined,
      nbDishwasher: electro_lave_vaiselle?.getValue(),
      nbWashingMachine: electro_lave_linge?.getValue(),
      nbDryer: electro_seche_linge?.getValue(),
      nbMobileAirConditioner: electro_climatiseur_mobile?.getValue(),
      hasElectricHeater: chauffage?.isSelected('electricite'),
      hasHeatPump: chauffage_pompe_chaleur?.getSelectedCode() === 'oui',
      heatPumpType: type_pompe_chaleur_value,
      hasElectricCooker: electro_cuiseur_elec?.getSelectedCode() === 'oui',
      hasElectricOven: electro_four_elec?.getSelectedCode() === 'oui',
      hasGasOven: electro_four_gaz?.getSelectedCode() === 'oui',
      hasOvenInWorkingPlan: electro_four_externe?.getSelectedCode() === 'oui',
      hasGasHotPlate: electro_plaques_gaz?.getSelectedCode() === 'oui',
      hasWaterHeaterStorage: stockage_eau_chaude?.getSelectedCode() === 'oui',
      nbSolarPanel: nbr_panneaux_solaires?.getValue(),
      nbElectricCar: transport_nbr_voitures_elec?.getValue(),
      nbElectricBike: transport_nbr_velo_elec?.getValue(),
      nbElectricScooter: transport_nbr_scooter_elec?.getValue(),
      housingYear: fourchette_annee_logement as any,
      housingType: type_maison,
      sharedWalls: murs_communs?.isSelected('oui'),
      livingArea: logement_superficie.getValue(),
      highFloorType: combles,
      houseLevels: nombre_niveaux?.getValue(),
      houseExteriorWalls: nombre_murs_exterieurs?.getValue(),
      apartmentFloor: type_etage,
      ventType: vmc,
      hotWaterType: hot_water_type as any,
      boilerInstallationYear: epoque_chauffage,
      heatingType: chauffage_reseau.isSelected('oui')
        ? 'district_heating_network'
        : 'personal',
      generatorTypeOther: gen_types,
      mainGenerator: main_chauffage,
      hasDoneWorks: logement_reno_second_oeuvre?.getSelectedCode() === 'oui',
      nbInhabitant: logement_habitants.getValue()
        ? logement_habitants.getValue()
        : 2,
      nbAdult: getNumQ(KYCID.KYC_logement_nombre_adultes)?.getValue(),
      inhabitantType: logement_proprio.isSelected('oui') ? 'owner' : 'tenant',
      windowType: vitrage,
      inhabitantHousing: type_residence.isSelected('principale')
        ? 'main'
        : 'secondary',
      renovatedWalls: isolation_murs,
    };
  }
}
