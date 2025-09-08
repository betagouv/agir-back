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
  hasElectricCooker?: boolean; // MAPPED KYC 316 => INCLUS ACTION
  hasElectricOven?: boolean; // MAPPED KYC 317 => INCLUS ACTION
  hasGasOven?: boolean; // MAPPED KYC 318 => INCLUS ACTION
  hasOvenInWorkingPlan?: boolean; // MAPPED KYC 319 => INCLUS ACTION
  hasGasHotPlate?: boolean; // MAPPED KYC 320 => INCLUS ACTION
  nbDishwasher?: number; // MAPPED KYC 105 => INCLUS ACTION
  nbWashingMachine?: number; // MAPPED KYC 103 => INCLUS ACTION
  nbDryer?: number; // MAPPED KYC104 => INCLUS ACTION
  nbMobileAirConditioner?: number; // MAPPED KYC 321 => INCLUS ACTION
  hasElectricWaterHeater?: boolean; // MAPPED 110 => INCUS ACTION
  hasElectricHeater?: boolean; // MAPPED KYC 59  => INCLUS ACTION
  hasHeatPump?: boolean; // MAPPED KYC 81 => INCLUS ACTION
  heatPumpType?: 'air-air' | 'air-water' | 'geotermal'; // MAPPED KYC 323 => INCLUS ACTION
  hasWaterHeaterStorage?: boolean; // MAPPED KYC 324 => INCLUS ACTION
  nbSolarPanel?: number; // MAPPED KYC 325  => INCLUS ACTION
  nbElectricCar?: number; // MAPPED KYC 326 => INCLUS ACTION
  nbElectricBike?: number; // MAPPED KYC 327 => INCLUS ACTION
  nbElectricScooter?: number; // MAPPED KYC 328 => INCLUS ACTION
  housingType?: 'terraced-house' | 'house' | 'apartment' | 'office'; // MAPPED KYC 56 => INCLUS ACTION
  sharedWalls?: boolean; // MAPPED KYC 329 => INCLUS ACTION
  livingArea?: number; //MAPPED KYC 62 => INCLUS ACTION
  housingYear?:
    | 'unknown'
    | 'before_48'
    | '49-88'
    | '89-11'
    | '12-21'
    | 'after_21'; // MAPPED KYC 191  => INCLUS ACTION
  houseLevels?: number; // MAPPED KYC 330  => INCLUS ACTION
  houseExteriorWalls?: number; // MAPPED KYC 331  => INCLUS ACTION
  apartmentFloor?: 'ground' | 'intermediate' | 'last'; // MAPPED KYC 332  => INCLUS ACTION
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
  hotWaterType?: // MAPPED KYC 310 => INCLUS ACTION
  | 'electric_water_heater'
    | 'heat_pump'
    | 'electric_water_heater_thermodynamic'
    | 'boiler_gaz'
    | 'boiler_fuel'
    | 'urban_heating_or_biomass'
    | 'other'
    | 'dont-know';
  boilerInstallationYear?: 'before-2010' | 'after-2010' | 'dont-know'; // MAPPED KYC 333 => INCLUS ACTION
  recentlyRenovated?: // MAPPED KYC 158 => INCLUS ACTION
  'floor' | 'walls' | 'generator' | 'attics' | 'roof' | 'vents' | 'windows';
  hasDoneWorks?: boolean; // MAPPED KYC 158 => INCLUS ACTION
  renovatedWalls?: 'walls_outside' | 'walls_inside';
  highFloorType?: 'converted_attics' | 'attics'; // MAPPED KYC 334 => INCLUS ACTION
  windowType?: 'middle_class' | 'high_class'; // MAPPED KYC_menage 335 => INCLUS ACTION
  ventType?: 'simple_vmc' | 'double_vmc'; // MAPPED KYC 336 => INCLUS ACTION
  inhabitantType?: 'owner' | 'tenant' | 'lessor'; // MAPPED KYC 61  => INCLUS ACTION
  inhabitantHousing?: 'main' | 'secondary';
  nbInhabitant?: number; // MAPPED Profil->logement
  nbAdult?: number; // MAPPED KYC_menage 58 => INCLUS ACTION
  inhabitantAges?: '0-18' | '18-60' | '60+';
};
