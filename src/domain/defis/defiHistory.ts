import { DefiHistory_v0 } from '../object_store/defi/defiHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
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

  public getDefisRestants(): Defi[] {
    const defis_all = CatalogueDefis.getAll();
    this.defis.forEach((defi_courant) => {
      const index = defis_all.findIndex((d) => d.id === defi_courant.id);
      if (index !== -1) {
        defis_all.splice(index, 1);
      }
    });
    return defis_all;
  }

  public getDefisEnCours(): Defi[] {
    const result = [];
    this.defis.forEach((defi_courant) => {
      if (defi_courant.getStatus() === DefiStatus.en_cours) {
        result.push(defi_courant);
      }
    });
    return result;
  }

  public getDefiOrException(id: string): Defi {
    let defi = this.getDefiUtilisateur(id);
    if (defi) return defi;

    return CatalogueDefis.getByIdOrException(id);
  }

  public updateStatus(defiId: string, status: DefiStatus, user: Utilisateur) {
    let defi = this.getDefiUtilisateur(defiId);
    if (defi) {
      defi.setStatus(status, user);
    } else {
      let defi_catalogue = CatalogueDefis.getByIdOrException(defiId);
      defi_catalogue.setStatus(status, user);
      this.defis.push(defi_catalogue);
    }
  }

  public checkDefiExists(questionId: string) {
    CatalogueDefis.getByIdOrException(questionId);
  }

  private getDefiUtilisateur(id: string): Defi {
    return this.defis.find((element) => element.id === id);
  }
}
