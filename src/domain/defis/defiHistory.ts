import { DefiHistory_v0 } from '../object_store/defi/defiHistory_v0';
import { CatalogueDefis } from './catalogueDefis';
import { Defi, DefiStatus } from './defi';

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

  public getDefiOrException(id: string): Defi {
    let defi = this.getDefiNonTodo(id);
    if (defi) return defi;

    const catalogue_defi = CatalogueDefis.getByIdOrException(id);
    return new Defi(catalogue_defi);
  }

  public updateStatus(defiId: string, status: DefiStatus) {
    let defi = this.getDefiNonTodo(defiId);
    if (defi) {
      defi.status = status;
    } else {
      let defi_catalogue = CatalogueDefis.getByIdOrException(defiId);
      defi_catalogue.status = status;
      this.defis.push(defi_catalogue);
    }
  }

  public checkQuestionExists(questionId: string) {
    CatalogueDefis.getByIdOrException(questionId);
  }

  private getDefiNonTodo(id: string): Defi {
    return this.defis.find((element) => element.id === id);
  }
}
