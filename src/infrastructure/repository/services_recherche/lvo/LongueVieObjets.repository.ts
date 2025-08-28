import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../domain/app';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../../applicationError';
import { AddressesRepository } from '../addresses.repository';
import { LongueVieObjetsCategorieMapping } from './LongueVieObjetsCategorieMapping';
import { ActeurLVAO_API } from './lvaoInternalAPI';

export type LVOResponse = {
  items: [
    {
      latitude: number;
      longitude: number;
      services: [
        {
          id: number;
          code: string; //"service_de_reparation",
          libelle: string; //"Service de réparation"
        },
      ];
      actions: [
        {
          id: number;
          code: string; //'reparer';
          libelle: string; //'réparer';
          couleur: string; //'green-menthe';
        },
      ];
      type: {
        id: number;
        code: string; //'artisan';
        libelle: string; //'artisan, commerce indépendant';
      };
      distance: number; // 908.13108708
      nom: string; //'Éts Gargne Capelle';
      nom_commercial: string; //'';
      adresse: string; //'LIEU DIT LAPEYRE';
      sources: string[]; //["Longue Vie Aux Objets","ADEME", "Bibliothèques - Ministère de la culture" ]
      identifiant_unique: string; //'ets_gargne_capelle_160221_reparation_0555285063';
      siret: string; //'35351809500016';
    },
  ];
  count: number;
};

@Injectable()
export class LongueVieObjetsRepository implements FinderInterface {
  constructor(private addressesRepository: AddressesRepository) {}

  static API_TIMEOUT = 4000;

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.vos_objets,
      CategorieRecherche.donner,
      CategorieRecherche.reparer,
      CategorieRecherche.vendre,
      CategorieRecherche.louer,
      CategorieRecherche.acheter,
      CategorieRecherche.emprunter,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const categorie_lvo =
      LongueVieObjetsCategorieMapping.getFiltreFromCategorie(
        CategorieRecherche[filtre.categorie],
        App.isLVAOInnerService(),
      );
    if (!filtre.hasPoint()) {
      const location =
        await this.addressesRepository.findLocationFromCodePostalCommune(
          filtre.code_postal,
          filtre.commune,
        );
      if (!location) {
        return [];
      }
      filtre.point = location;
    }
    if (App.isLVAOInnerService()) {
      const result = await this.callInnerServiceAPI(filtre, categorie_lvo);
      if (!result) {
        ApplicationError.throwExternalServiceError('Longue vie objets');
      }
      const final_result: ResultatRecherche[] = result.map(
        (r) =>
          new ResultatRecherche({
            id: r.id,
            nbr_resultats_max_dispo: 286000,
            titre: r.nom,
            adresse_rue: r.adresse,
            adresse_complete: r.adresse + ', ' + r.code_postal + ' ' + r.ville,
            siret: r.siret,
            distance_metres: r.distance_metres,
            latitude: r.latitude,
            longitude: r.longitude,
            categories: r.detail_services
              ? r.detail_services
                  .map((detail) =>
                    LongueVieObjetsCategorieMapping.getCategorieFromActionLVAO(
                      detail.action,
                    ),
                  )
                  .filter((a) => !!a)
              : [],
            sources_lvao: r.sources,
          }),
      );
      return final_result;
    } else {
      const result = await this.callServiceAPI(filtre, categorie_lvo);

      if (!result) {
        ApplicationError.throwExternalServiceError('Longue vie objets');
      }
      const final_result: ResultatRecherche[] = result.items.map(
        (r) =>
          new ResultatRecherche({
            id: r.identifiant_unique,
            nbr_resultats_max_dispo: result.count,
            titre: r.nom,
            adresse_rue: r.adresse,
            adresse_complete: r.adresse,
            siret: r.siret,
            distance_metres: r.distance ? Math.round(r.distance) : undefined,
            latitude: r.latitude,
            longitude: r.longitude,
            categories: r.actions
              ? r.actions
                  .map((a) =>
                    LongueVieObjetsCategorieMapping.getCategorieFromAction(
                      a.id,
                    ),
                  )
                  .filter((a) => !!a)
              : [],
            sources_lvao: r.sources,
          }),
      );
      return final_result;
    }
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
    categorie,
  ): Promise<LVOResponse> {
    let response;
    const call_time = Date.now();
    const params = {
      rayon: filtre.rayon_metres ? filtre.rayon_metres / 1000 : 5,
      offset: 0,
      latitude: filtre.point.latitude,
      longitude: filtre.point.longitude,
      limit: filtre.nombre_max_resultats ? filtre.nombre_max_resultats : 10,
    };

    if (categorie && categorie !== 'undefined') {
      params['actions'] = categorie;
    }

    try {
      response = await axios.get(App.getLVO_API_URL(), {
        timeout: LongueVieObjetsRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
        params: params,
      });
    } catch (error) {
      console.log(`Error calling [lvo] after ${Date.now() - call_time} ms`);
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:lvo:${Date.now() - call_time}`);

    return response.data;
  }

  private async callInnerServiceAPI(
    filtre: FiltreRecherche,
    categorie: string,
  ): Promise<ActeurLVAO_API[]> {
    let response;
    const call_time = Date.now();
    const params = {
      rayon_metres: filtre.rayon_metres ? filtre.rayon_metres : 5000,
      latitude: filtre.point.latitude,
      longitude: filtre.point.longitude,
      limit: filtre.nombre_max_resultats ? filtre.nombre_max_resultats : 10,
    };

    if (categorie && categorie !== 'undefined') {
      params['action'] = categorie;
    }

    try {
      response = await axios.get(App.getLVO_API_INTERNAL_URL(), {
        timeout: LongueVieObjetsRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getLVO_API_INTERNAL_KEY()}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(
        `Error calling [lvo interne] after ${Date.now() - call_time} ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:lvo_interne:${Date.now() - call_time}`);

    return response.data;
  }
}
