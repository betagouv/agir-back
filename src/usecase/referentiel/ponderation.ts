export enum RubriquePonderationSetName {
  neutre = 'neutre',
  noel = 'noel',
}

export enum RubriquesId {
  R1 = '1',
  R2 = '2',
  R3 = '3',
  R4 = '4',
  R5 = '5',
  R6 = '6',
  R7 = '7',
  R8 = '8',
  R9 = '9',
  R10 = '10',
  R11 = '11',
  R12 = '12',
  R13 = '13',
  R14 = '14',
  R15 = '15',
  R16 = '16',
  R17 = '17',
  R18 = '18',
  R19 = '19',
  R20 = '20',
  R21 = '21',
  R22 = '22',
  R23 = '23',
  R24 = '24',
  R25 = '25',
  R26 = '26',
  R27 = '27',
  R28 = '28',
  R29 = '29',
  R30 = '30',
  R31 = '31',
  R32 = '32',
  R33 = '33',
  R34 = '34',
  R35 = '35',
  R36 = '36',
}

export type RubriquePonderationSetValues = { [key in RubriquesId]?: number };
export type RubriquePonderation = {
  [key in RubriquePonderationSetName]?: RubriquePonderationSetValues;
};

export class PonderationManager {
  private static ponderation_catalogue: RubriquePonderation = {
    noel: {
      '32': 10,
      '33': 10,
      '34': 10,
      '35': 10,
      '36': 10,
    },
    neutre: {},
  };
  public static getPonderations(
    set: RubriquePonderationSetName,
  ): RubriquePonderationSetValues {
    return PonderationManager.ponderation_catalogue[set];
  }
}
