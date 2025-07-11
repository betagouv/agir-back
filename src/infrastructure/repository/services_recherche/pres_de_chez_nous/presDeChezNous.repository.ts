import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../domain/app';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { Day } from '../../../../domain/bibliotheque_services/types/days';
import { OpenHour } from '../../../../domain/bibliotheque_services/types/openHour';
import { ApplicationError } from '../../../applicationError';
import { AddressesRepository } from '../addresses.repository';
import { PresDeChezNousCategorieMapping } from './presDeChezNousCategorieMapping';

const API_URL = 'https://presdecheznous.gogocarto.fr/api/elements.json';

export enum DaysPresDeChezNous {
  Mo = 'Mo',
  Tu = 'Tu',
  We = 'We',
  Th = 'Th',
  Fr = 'Fr',
  Sa = 'Sa',
  Su = 'Su',
}

export type PresDeChezVousElementReponse = {
  id: string; //"AEW"
  name: string; // "DotSoley : Amap, Gwada Fungi, Jardins partagés, Jardins pédagogiques",
  geo: {
    latitude: number;
    longitude: number;
  };
  sourceKey: string; //"Colibris"
  address: {
    streetAddress: string; //"centre equestre martingale",
    addressLocality: string; //"Baie mahault",
    postalCode: string; //"97122",
    addressCountry: string; //"FR"
  };
  createdAt: string; //"2017-08-01T14:15:08+02:00",
  updatedAt: string; //"2018-01-16T16:50:03+01:00",
  status: number; //4,
  categories: string[]; //[      "Alimentation et Agriculture",      "Circuits courts",      "AMAP / Paniers",      "Autre produit"    ],
  categoriesFull: {
    id: number;
    name: string;
    description: string;
    index: number;
  }[];
  website: string; //"http://www.dotsoley.asso.gp",
  commitment: string; //"Promotion de l'agriculture locale",
  description: string; //"Panier et fruits et légumes",
  description_more: string; //"Panier et fruits et légumes",
  openhours: Record<DaysPresDeChezNous, string>;
  openhours_more_infos: string; //"Lundi à partir de 18h00",
  telephone: string; //"0590262839",
  email: string; //"private",
  subscriberEmails: [];
  images: string[]; //['https://presdecheznous.gogocarto.fr/uploads/presdecheznous/images/elements/CapOuPasCap/2018/09/logo_amap_arbre_v1.3a.png']
};
export type PresDeChezVousResponse = {
  licence: string; //"https://opendatacommons.org/licenses/odbl/summary/",
  ontology: string; //"gogofull",
  data: PresDeChezVousElementReponse[];
};

@Injectable()
export class PresDeChezNousRepository implements FinderInterface {
  static API_TIMEOUT = 10000;

  constructor(private addressesRepository: AddressesRepository) {}

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.nourriture,
      CategorieRecherche.circuit_court,
      CategorieRecherche.epicerie_superette,
      CategorieRecherche.marche_local,
      CategorieRecherche.zero_dechet,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
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

    if (filtre.rayon_metres) {
      filtre.computeBox(filtre.rayon_metres);
    } else {
      filtre.computeBox(5000);
    }

    const liste_categories =
      PresDeChezNousCategorieMapping.getFiltreFromCategorie(
        CategorieRecherche[filtre.categorie],
      );

    const result = await this.callServiceAPI(filtre, liste_categories);

    if (!result) {
      ApplicationError.throwExternalServiceError('Près de chez nous');
    }

    const final_result: ResultatRecherche[] = result.data.map(
      (r) =>
        new ResultatRecherche({
          id: r.id,
          longitude: r.geo.longitude,
          latitude: r.geo.latitude,
          site_web: r.website,
          titre: r.name,
          adresse_rue: r.address.streetAddress,
          adresse_code_postal: r.address.postalCode,
          adresse_nom_ville: r.address.addressLocality,
          adresse_complete: this.buildAddress(r),
          image_url: r.images && r.images.length ? r.images[0] : null,
          categories: r.categories,
          commitment: r.commitment,
          description: r.description,
          description_more: r.description_more,
          open_hours: this.mapOpenHours(r.openhours),
          openhours_more_infos: r.openhours_more_infos,
          phone: r.telephone,
          nbr_resultats_max_dispo: result.data.length,
        }),
    );

    for (const resultat of final_result) {
      resultat.distance_metres = filtre.getDistanceMetresFromSearchPoint2(
        resultat.latitude,
        resultat.longitude,
      );
    }

    final_result.sort((a, b) => a.distance_metres - b.distance_metres);

    const filtered = this.filter(final_result);

    const subset = filtered.slice(
      0,
      filtre.nombre_max_resultats ? filtre.nombre_max_resultats : 10,
    );

    return subset;
  }

  private buildAddress(input: PresDeChezVousElementReponse): string {
    let result = '';

    result += input.address.streetAddress ? input.address.streetAddress : '';
    if (input.address.postalCode || input.address.addressLocality) {
      result += ',';
    }
    result += input.address.postalCode ? ' ' + input.address.postalCode : '';
    result += input.address.addressLocality
      ? ' ' + input.address.addressLocality
      : '';
    return result;
  }

  public mapOpenHours(hours: Record<DaysPresDeChezNous, string>): OpenHour[] {
    if (!hours) return [];

    const DAY_MAP = {
      Mo: Day.lundi,
      Tu: Day.mardi,
      We: Day.mercredi,
      Th: Day.jeudi,
      Fr: Day.vendredi,
      Sa: Day.samedi,
      Su: Day.dimanche,
    };
    const result: OpenHour[] = [];
    for (const [key, value] of Object.entries(hours)) {
      result.push({ jour: DAY_MAP[key], heures: value });
    }
    return result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
    categories: string,
  ): Promise<PresDeChezVousResponse> {
    let response;
    const call_time = Date.now();
    try {
      response = await axios.get(API_URL, {
        timeout: PresDeChezNousRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          categories: categories,
          limit: 100,
          bounds: `${filtre.rect_A.longitude},${filtre.rect_A.latitude},${filtre.rect_B.longitude},${filtre.rect_B.latitude}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [presdecheznous] after ${Date.now() - call_time} ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:presdecheznous:${Date.now() - call_time}`);
    return response.data;
  }

  private filter(liste: ResultatRecherche[]): ResultatRecherche[] {
    return liste.filter((r) => !App.isInPDCFilter(r.id));
  }
}
