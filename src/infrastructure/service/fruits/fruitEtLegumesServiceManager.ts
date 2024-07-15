import { Injectable } from '@nestjs/common';
import { ServiceDynamicData } from '../../../../src/domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import fruits_legumes from './fruits_legumes.json';

export enum FruitLegume {
  fruit = 'fruit',
  legume = 'legume',
  fruit_et_legume = 'fruit_et_legume',
}

export type rawEntry = {
  label: Record<'fr', string>;
  months: number[];
  emoji: string;
  local: boolean;
  pef: number;
  CO2: number;
  suggestions?: boolean;
  type?: FruitLegume;
};

@Injectable()
export class FruitsEtLegumesServiceManager implements LiveServiceManager {
  private entriesByMonthMap: Map<number, { label: string; co2: number }[]>;
  private entriesByNameMap: Map<string, rawEntry>;

  constructor() {
    this.loadFruitsData(fruits_legumes as rawEntry[]);
    this.filterOutHighCo2Data();
  }

  loadFruitsData(fruits: rawEntry[]) {
    this.entriesByMonthMap = new Map();
    this.entriesByNameMap = new Map();

    for (let month = 0; month < 12; month++) {
      this.entriesByMonthMap.set(month, []);
      fruits.forEach((entry) => {
        this.entriesByNameMap.set(entry.label.fr, entry);
        if (entry.months.includes(month)) {
          this.getMonthEntries(month).push({
            label: entry.emoji.concat(' ', entry.label.fr),
            co2: entry.CO2,
          });
        }
      });
    }
  }

  public getEmoji(nom: string): string {
    const entry = this.entriesByNameMap.get(nom);
    return entry ? entry.emoji : null;
  }

  public getType(nom: string): FruitLegume {
    const entry = this.entriesByNameMap.get(nom);
    return entry ? entry.type : null;
  }

  public getMonthEntries(month: number) {
    return this.entriesByMonthMap.get(month);
  }
  filterOutHighCo2Data() {
    for (let month = 0; month < 12; month++) {
      this.entriesByMonthMap.set(
        month,
        this.filterOutHighCO2MonthEntries(this.getMonthEntries(month)),
      );
    }
  }

  async computeLiveDynamicData(): Promise<ServiceDynamicData> {
    return this.computeDataForGivenMonth(new Date().getMonth());
  }

  async computeDataForGivenMonth(month: number): Promise<ServiceDynamicData> {
    const current_list = this.getMonthEntries(month);
    const random_position = Math.floor(Math.random() * current_list.length);
    return {
      label: current_list[random_position].label,
      isInError: false,
    };
  }

  filterOutHighCO2MonthEntries(
    liste: { label: string; co2: number }[],
  ): { label: string; co2: number }[] {
    if (liste.length <= 5) {
      return liste;
    }
    let result = [];
    liste.sort((a, b) => b.co2 - a.co2);
    for (let index = 5; index < liste.length; index++) {
      result.push(liste[index]);
    }
    return result;
  }
}
