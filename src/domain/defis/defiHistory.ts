import { DefiHistory_v0 } from '../object_store/defi/defiHistory_v0';
import { Defi } from './defi';

export class DefiHistory {
  defis: Defi[];

  constructor(data?: DefiHistory_v0) {
    this.defis = [];
    if (data && data.defis) {
      data.defis.forEach((element) => {
        this.defis.push(new Defi(element));
      });
    }
  }
}
