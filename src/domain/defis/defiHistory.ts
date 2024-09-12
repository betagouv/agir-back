import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { DefiHistory_v0 } from '../object_store/defi/defiHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Defi, DefiStatus } from './defi';
import { DefiDefinition } from './defiDefinition';

export class DefiHistory {
  defis: Defi[];
  private catalogue: DefiDefinition[];

  constructor(data?: DefiHistory_v0) {
    this.reset();

    if (data && data.defis) {
      data.defis.forEach((element) => {
        this.defis.push(new Defi(element));
      });
    }
  }

  public reset() {
    this.defis = [];
    this.catalogue = [];
  }
  public setCatalogue(cat: DefiDefinition[]) {
    this.catalogue = cat;
  }

  public getDefisRestants(categorie?: Categorie, univers?: string): Defi[] {
    let defis_def_restants: DefiDefinition[] = [].concat(this.catalogue);
    this.defis.forEach((defi_courant) => {
      const index = defis_def_restants.findIndex(
        (d) => d.content_id === defi_courant.id,
      );
      if (index !== -1) {
        defis_def_restants.splice(index, 1);
      }
    });

    if (univers) {
      defis_def_restants = defis_def_restants.filter(
        (defi) =>
          defi.universes.includes(univers) || defi.universes.length === 0,
      );
    }
    if (categorie) {
      defis_def_restants = defis_def_restants.filter(
        (defi) => defi.categorie === categorie,
      );
    }

    return defis_def_restants.map((d) => this.buildDefiFromDefinition(d));
  }

  public getDefisOfStatus(status_list: DefiStatus[]): Defi[] {
    if (status_list.length === 0) {
      return this.defis.filter(
        (e) => e.accessible || e.getStatus() !== DefiStatus.todo,
      );
    }
    const result = [];
    this.defis.forEach((defi_courant) => {
      if (
        status_list.includes(defi_courant.getStatus()) &&
        (defi_courant.accessible ||
          defi_courant.getStatus() !== DefiStatus.todo)
      ) {
        result.push(defi_courant);
      }
    });
    return result;
  }

  public getDefiOrException(id: string): Defi {
    let defi = this.getDefiFromHistory(id);
    if (defi) return defi;

    return this.getFromCatalogueOrException(id);
  }

  public updateStatus(
    defiId: string,
    status: DefiStatus,
    user: Utilisateur,
    motif: string,
  ) {
    let defi = this.getDefiFromHistory(defiId);
    if (defi) {
      defi.setStatus(status, user);
      defi.motif = motif;
    } else {
      let defi_catalogue = this.getFromCatalogueOrException(defiId);
      defi_catalogue.setStatus(status, user);
      defi_catalogue.motif = motif;
      this.defis.push(defi_catalogue);
    }
  }

  public checkDefiExists(questionId: string) {
    this.getFromCatalogueOrException(questionId);
  }

  public getNombreDefisRealises() {
    return this.defis.filter((defi) => defi.getStatus() === DefiStatus.fait)
      .length;
  }

  public getNombreDefisAbandonnes() {
    return this.defis.filter((defi) => defi.getStatus() === DefiStatus.abondon)
      .length;
  }

  public getNombreDefisPasEnvie() {
    return this.defis.filter(
      (defi) => defi.getStatus() === DefiStatus.pas_envie,
    ).length;
  }

  public getNombreDefisEnCours() {
    return this.defis.filter((defi) => defi.getStatus() === DefiStatus.en_cours)
      .length;
  }

  public getDefiFromHistory(id: string): Defi {
    return this.defis.find((element) => element.id === id);
  }

  public estDefiEnCoursOuPlus(id: string): boolean {
    const defi = this.defis.find((element) => element.id === id);
    if (defi) {
      return [
        DefiStatus.en_cours,
        DefiStatus.fait,
        DefiStatus.pas_envie,
        DefiStatus.deja_fait,
      ].includes(defi.getStatus());
    }
    return false;
  }

  public getPlusVieuxDefiEnCours(): Defi {
    const defis_encours_avec_date = this.defis.filter(
      (d) => d.getStatus() === DefiStatus.en_cours && d.date_acceptation,
    );

    defis_encours_avec_date.sort(
      (a, b) => a.date_acceptation.getTime() - b.date_acceptation.getTime(),
    );

    if (defis_encours_avec_date.length > 0) {
      return defis_encours_avec_date[0];
    }
    return null;
  }

  private getFromCatalogueOrException(id: string): Defi {
    const definition = this.catalogue.find(
      (element) => element.content_id === id,
    );
    if (definition) {
      return this.buildDefiFromDefinition(definition);
    }
    ApplicationError.throwDefiInconnue(id);
  }

  private buildDefiFromDefinition(def: DefiDefinition) {
    return new Defi({
      ...def,
      id: def.content_id,
      status: DefiStatus.todo,
      date_acceptation: null,
      accessible: false,
      motif: null,
    });
  }
}
