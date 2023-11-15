import { Injectable } from '@nestjs/common';
import { ServiceDynamicData } from '../../../../src/domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import fruits_legumes from './fruits_legumes.json';

export type rawEntry = {
  label: Record<'fr', string>;
  months: number[];
  emoji: string;
  local: boolean;
  pef: number;
  CO2: number;
  suggestions: boolean;
};

@Injectable()
export class FruitsEtLegumesServiceManager implements LiveServiceManager {
  private entriesByMonthMap: Map<number, string[]>;

  constructor() {
    let load: rawEntry[] = fruits_legumes as rawEntry[];
    this.entriesByMonthMap = new Map();
    for (let month = 0; month < 12; month++) {
      this.entriesByMonthMap.set(month, []);
      load.forEach((entry) => {
        if (entry.months.includes(month)) {
          this.entriesByMonthMap
            .get(month)
            .push(entry.emoji.concat(' ', entry.label.fr));
        }
      });
    }
  }
  async computeLiveDynamicData(): Promise<ServiceDynamicData> {
    const current_month = new Date().getMonth();
    const current_list = this.entriesByMonthMap.get(current_month);
    const random_position = Math.floor(Math.random() * current_list.length);
    return {
      label: current_list[random_position],
      isInError: false,
    };
  }
}
