export type Bilan = {
  bilan_carbone_annuel: number;
  details: {
    divers: number;
    logement: number;
    transport: number;
    alimentation: number;
    services_societaux: number;
  };
};
