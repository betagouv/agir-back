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

export type WinterHousingData = {
  nbAmericanRefrigerator?: number; // MAPPED KYC 313 => INCLUS ACTION
  nbClassicRefrigerator?: number; // MAPPED KYC 100 => INCLUS ACTION
  nbOneDoorRefrigerator?: number; // MAPPED KYC 101 => INCLUS ACTION
  nbFreezer?: number; // MAPPED  KYC 102 => INCLUS ACTION
  nbPool?: number; // MAPPED KYC 259 => INCLUS ACTION
  nbWineCave?: number; // MAPPED KYC 314 => INCLUS ACTION
  nbTV?: number; // MAPPED KYC 115 => INCLUS ACTION
  nbConsole?: number; // MAPPED (console de salon ?) KYC 125 => INCLUS ACTION
  nbInternetBox?: number; // MAPPED KYC 315 => INCLUS ACTION
  hasElectricHotPlate?: boolean; // MAPPED KYC 108 => INCLUS ACTION
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
  hasElectricHeater?: boolean; // MAPPED KYC 59  => INCLUS ACTION ?
  hasHeatPump?: boolean; // MAPPED KYC 81
  heatPumpType?: 'air-air' | 'air-water' | 'geotermal';
  hasWaterHeaterStorage?: boolean;
  nbSolarPanel?: number; // MAPPED KYC 64
  nbElectricCar?: number; // MAPPED KYC 141
  nbElectricBike?: number; // MAPPED KYC 237
  nbElectricScooter?: number; // MAPPED KYC 147
  housingType?: 'terraced-house' | 'house' | 'apartment' | 'office'; // MAPPED KYC 309 => INCLUS ACTION
  sharedWalls?: boolean;
  livingArea?: number; //MAPPED KYC 62
  housingYear?:
    | 'unknown'
    | 'before_48'
    | '49-88'
    | '89-11'
    | '12-21'
    | 'after_21'; // MAPPED KYC 191  => INCLUS ACTION
  houseLevels?: number;
  houseExteriorWalls?: number;
  apartmentFloor?: 'ground' | 'intermediate' | 'last';
  heatingType?: 'district_heating_network' | 'personal' | 'dont-know'; // MAPPED KYC 84  => INCLUS ACTION
  generatorTypeOther?: (
    | 'electric'
    | 'heat_pump'
    | 'boiler_gaz'
    | 'boiler_wood'
    | 'boiler_fuel'
    | 'other'
    | 'dont-know'
  )[]; // MAPPED KYC 59 => INCLUS ACTION
  mainGenerator?:
    | 'boiler_gas'
    | 'boiler_wood'
    | 'boiler_fuel'
    | 'electric'
    | 'other'
    | 'dont-know'
    | 'heat_pump'; // MAPPED KYC 59 => INCLUS ACTION
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
  recentlyRenovated?: // MAPPED KYC 158 => INCLUS ACTION
  'floor' | 'walls' | 'generator' | 'attics' | 'roof' | 'vents' | 'windows';
  hasDoneWorks?: boolean; // MAPPED KYC 158 => INCLUS ACTION
  renovatedWalls?: boolean;
  highFloorType?: 'converted_attics' | 'attics';
  windowType?: 'middle_class' | 'high_class';
  ventTypev?: 'simple_vmc' | 'double_vmc';
  inhabitantType?: 'owner' | 'tenant' | 'lessor'; // MAPPED KYC 61  => INCLUS ACTION
  inhabitantHousing?: 'main' | 'secondary';
  nbInhabitant?: number; // MAPPED Profil->logement
  nbAdult?: number; // MAPPED KYC_menage 58 => INCLUS ACTION
  inhabitantAges?: '0-18' | '18-60' | '60+';
};
