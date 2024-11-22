import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
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

  public getDefisRestantsByCategorieAndThematique(
    categorie?: Categorie,
    thematique?: Thematique,
  ): Defi[] {
    let liste_nouveaux_defis = [];
    for (const defi_catalogue of this.catalogue) {
      const defi_utilisateur = this.getDefiFromHistory(
        defi_catalogue.content_id,
      );
      if (!defi_utilisateur) {
        liste_nouveaux_defis.push(defi_catalogue);
      }
    }

    if (thematique) {
      liste_nouveaux_defis = liste_nouveaux_defis.filter(
        (defi) => defi.thematique === thematique,
      );
    }
    if (categorie) {
      liste_nouveaux_defis = liste_nouveaux_defis.filter(
        (defi) => defi.categorie === categorie,
      );
    }

    return liste_nouveaux_defis.map((d) => this.buildDefiFromDefinition(d));
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
      sont_points_en_poche: false,
      impact_kg_co2: 0,
    });
  }
}
