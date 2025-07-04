import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { ApplicationError } from '../../applicationError';

const SEARCH_PRM_URL =
  'https://api.winter-energies.fr/api/partner/1.0/prm/search';

const INSCRIRE_PRM_URL = 'https://api.winter-energies.fr/api/partner/1.0/user';

const SUPPRIMER_PRM_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID';

const LISTER_ACTIONS_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID/action';

const USAGE_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID/housing/usage-breakdown';

const PUT_HOUSING_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID/housing';

const API_TIMEOUT = 5000;

export type WinterFoundPRM = {
  prm: string;
  address: string;
  zipcode: string;
  city: string;
  name: string;
};

export type WinterHousingData = {
  nbAmericanRefrigerator?: number;
  nbClassicRefrigerator?: number; // MAPPED KYC 100
  nbOneDoorRefrigerator?: number; // MAPPED KYC 101
  nbFreezer?: number; // MAPPED  KYC 102
  nbPool?: number; // MAPPED KYC 259
  nbWineCave?: number;
  nbTV?: number; // MAPPED KYC 115
  nbConsole?: number; // MAPPED (console de salon ?) KYC 125
  nbInternetBox?: number;
  hasElectricHotPlate?: boolean; // MAPPED KYC 108
  hasElectricCooker?: boolean;
  hasElectricOven?: boolean;
  hasGasOven?: boolean;
  hasOvenInWorkingPlan?: boolean;
  hasGasHotPlate?: boolean;
  nbDishwasher?: number; // MAPPED KYC 105
  nbWashingMachine?: number; // MAPPED KYC 103
  nbDryer?: number; // MAPPED KYC104
  nbMobileAirConditioner?: number;
  hasElectricWaterHeater?: boolean;
  hasElectricHeater?: boolean; // MAPPED KYC 59
  hasHeatPump?: boolean; // MAPPED KYC 81
  heatPumpType?: 'air-air' | 'air-water' | 'geotermal';
  hasWaterHeaterStorage?: boolean;
  nbSolarPanel?: number; // MAPPED KYC 64
  nbElectricCar?: number; // MAPPED KYC 141
  nbElectricBike?: number; // MAPPED KYC 237
  nbElectricScooter?: number; // MAPPED KYC 147
  housingType?: 'terraced-house' | 'house' | 'apartment' | 'office';
  sharedWalls?: boolean;
  livingArea?: number;
  housingYear?: number; // MAPPED KYC 191
  houseLevels?: number;
  houseExteriorWalls?: number;
  apartmentFloor?: 'ground' | 'intermediate' | 'last';
  heatingType?: 'district_heating' | '_network' | 'personal' | 'dont-know'; // MAPPED KYC 84
  generatorTypes?: (
    | 'electric_generator'
    | 'heat_pump'
    | 'boiler_gaz'
    | 'boiler_wood'
    | 'boiler_fuel'
    | 'other'
    | 'dont-know'
  )[]; // MAPPED KYC 59
  mainGenerator?:
    | 'boiler_gas'
    | 'boiler_wood'
    | 'boiler_fuel'
    | 'electric_generator'
    | 'other'
    | 'dont-know'
    | 'heat_pump';
  secondaryGenerators?: Record<
    | 'boiler_gas'
    | 'boiler_wood'
    | 'boiler_fuel'
    | 'electric_generator'
    | 'other'
    | 'dont-know'
    | 'heat_pump',
    'regularly' | 'occasionally' | 'rarely' | 'never'
  >;
  hasAuxilaryGenerator?: boolean;
  renovatedGeneratorType?: 'air-air' | 'air-water';
  hotWaterType?:
    | 'electric_water_heater'
    | 'heat_pump'
    | 'electric_water_heater_thermodynamic'
    | 'boiler_gaz'
    | 'boiler_fuel'
    | 'urban_heating_or_biomass'
    | 'other'
    | 'dont-know';
  boilerInstallationYear?: 'before-2010' | 'after-2010' | 'dont-know';
  recentlyRenovated?: // MAPPED KYC 158
  'floor' | 'walls' | 'generator' | 'attics' | 'roof' | 'vents' | 'windows';
  hasDoneWorks?: boolean; // MAPPED KYC 158
  renovatedWalls?: boolean;
  highFloorType?: 'converted_attics' | 'attics';
  windowType?: 'middle_class' | 'high_class';
  ventTypev?: 'simple_vmc' | 'double_vmc';
  inhabitantType?: 'owner' | 'tenant' | 'lessor'; // MAPPED KYC 61
  inhabitantHousing?: 'main' | 'secondary';
  nbInhabitant?: number; // MAPPED Profil->logement
  nbAdult?: number; // MAPPED Profil->logement
  inhabitantAges?: '0-18' | '18-60' | '60+';
};

export enum WinterUsage {
  heating = 'heating',
  hotWater = 'hotWater',
  cooking = 'cooking',
  appliances = 'appliances',
  multimedia = 'multimedia',
  airConditioning = 'airConditioning',
  lighting = 'lighting',
  mobility = 'mobility',
  swimmingPool = 'swimmingPool',
  other = 'other',
}

export type WinterUsageBreakdown = {
  yearlyElectricityTotalConsumption: {
    unit: string; //"years" "€",
    value: number;
  }[];
  monthsOfDataAvailable: number;
  computingFinished: boolean;
  usageBreakdown: {
    [key in WinterUsage]?: {
      kWh: number;
      eur: number;
      percent: number;
    };
  } & { isStatistical: boolean };
};

export type WinterAction = {
  slug: string; //"depoussierer-grille-refrigerateur",
  eligibility: string; //"eligible",
  economy: number; // 10,
  status: string; //"not_started",
  type: string; //"ecogeste",
  usage: string; //"appliances"
};

export type WinterActionList = {
  actionStateProxyResponse: WinterAction[];
  computingFinished: boolean;
};

@Injectable()
export class WinterAPIClient {
  constructor() {}

  public async searchPRM(
    nom: string,
    rue: string,
    code_postal: string,
    nom_commune: string,
  ): Promise<WinterFoundPRM[]> {
    let response;
    const call_time = Date.now();
    const params = {
      lastname: nom,
      zipcode: code_postal,
      city: nom_commune,
      address: rue,
    };
    try {
      response = await axios.get(SEARCH_PRM_URL, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getWinterAPIKey()}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(
        `Error calling [winter_search_prm ${nom}-${code_postal}-${nom_commune}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      return [];
    }
    console.log(`API_TIME:winter_search_prm:${Date.now() - call_time}`);

    return response.data as WinterFoundPRM[];
  }

  public async usage(ext_id: string): Promise<WinterUsageBreakdown> {
    let response;
    const call_time = Date.now();
    try {
      response = await axios.get(USAGE_URL.replace('USER_ID', ext_id), {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_usage ${ext_id}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      return undefined;
    }
    console.log(`API_TIME:winter_usage/${ext_id}:${Date.now() - call_time}`);

    return response.data as WinterUsageBreakdown;
  }

  public async inscrirePRM(
    prm: string,
    nom: string,
    ext_id: string,
    ip: string,
    user_agent: string,
    version_consentement: string,
  ): Promise<void> {
    let response;
    const call_time = Date.now();
    const payload = {
      prm: prm,
      name: nom,
      externalId: ext_id,
      ip: ip,
      userAgent: user_agent,
      version: version_consentement,
    };
    try {
      response = await axios.put(INSCRIRE_PRM_URL, payload, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_put_prm ${JSON.stringify(payload)}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      if (error?.response?.data?.enedisCode === 'SGT570') {
        ApplicationError.throwErrorAlreadyInscriptionDONE();
      }
      if (error?.response?.data?.message === 'prm already used') {
        ApplicationError.throwErrorAlreadyInscriptionDONE();
      }
      ApplicationError.throwErrorInscriptionPRM();
    }
    console.log(`API_TIME:winter_put_prm/${prm}:${Date.now() - call_time}`);
  }

  public async pushHousingData(
    ext_id: string,
    data: WinterHousingData,
  ): Promise<void> {
    const call_time = Date.now();
    try {
      await axios.put(PUT_HOUSING_URL.replace('USER_ID', ext_id), data, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_put_housing ${JSON.stringify(data)}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorInscriptionPRM();
    }
    console.log(
      `API_TIME:winter_put_housing/${ext_id}:${Date.now() - call_time}`,
    );
  }

  public async supprimerPRM(ext_id: string): Promise<void> {
    const call_time = Date.now();

    try {
      await axios.delete(SUPPRIMER_PRM_URL.replace('USER_ID', ext_id), {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_delete_prm user:${ext_id}]  after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorSuppressionPRM();
    }
    console.log(
      `API_TIME:winter_delete_prm:user:${ext_id}:${Date.now() - call_time}`,
    );
  }
  public async listerActions(ext_id: string): Promise<WinterActionList> {
    const call_time = Date.now();
    let response;
    try {
      response = await axios.get(
        LISTER_ACTIONS_URL.replace('USER_ID', ext_id),
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${App.getWinterAPIKey()}`,
          },
        },
      );
    } catch (error) {
      console.log(
        `Error calling [winter_actions:${ext_id}]  after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorListingWinterActions();
    }
    console.log(
      `API_TIME:winter_actions:user:${ext_id}:${Date.now() - call_time}`,
    );
    return response.data;
  }
}
