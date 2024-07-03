import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/resultatRecherche';
import { AddressesRepository } from '../addresses.repository';
import { PresDeChezNousCategorieMapping } from './presDeChezNousMetaCategorie';

const API_URL = 'https://presdecheznous.gogocarto.fr/api/elements.json';

export type PresDeChezVousResponse = {
  licence: string; //"https://opendatacommons.org/licenses/odbl/summary/",
  ontology: string; //"gogofull",
  data: {
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
    openhours_more_infos: string; //"Lundi à partir de 18h00",
    telephone: string; //"0590262839",
    email: string; //"private",
    subscriberEmails: [];
  }[];
};

@Injectable()
export class PresDeChezNousRepository implements FinderInterface {
  constructor(private addressesRepository: AddressesRepository) {}

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.circuit_court,
      CategorieRecherche.nourriture,
      CategorieRecherche.epicerie_superette,
      CategorieRecherche.marche_local,
      CategorieRecherche.zero_dechet,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const adresse = await this.addressesRepository.find(
      new FiltreRecherche({
        text: filtre.code_postal.concat(' ', filtre.commune),
      }),
    );

    if (adresse.length === 0) {
      return [];
    }

    const the_adresse = adresse[0];

    filtre.point = {
      latitude: the_adresse.latitude,
      longitude: the_adresse.longitude,
    };

    if (filtre.rayon_metres) {
      filtre.computeBox(filtre.rayon_metres);
    } else {
      filtre.computeBox(10000);
    }

    const liste_categories =
      PresDeChezNousCategorieMapping.getFiltreFromCategorie(
        CategorieRecherche[filtre.categorie],
      );

    const result = await this.callServiceAPI(filtre, liste_categories);

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
        }),
    );

    for (const resultat of final_result) {
      resultat.distance_metres = filtre.getDistanceMetresFromSearchPoint(
        resultat.latitude,
        resultat.longitude,
      );
    }
    final_result.sort((a, b) => a.distance_metres - b.distance_metres);

    return final_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
    categories: string,
  ): Promise<PresDeChezVousResponse> {
    let response;
    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          categories: categories,
          limit: filtre.nombre_max_resultats ? filtre.nombre_max_resultats : 10,
          bounds: `${filtre.rect_A.longitude},${filtre.rect_A.latitude},${filtre.rect_B.longitude},${filtre.rect_B.latitude}`,
        },
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response);
      } else if (error.request) {
        console.log(error.request);
      }
      return null;
    }
    return response.data;
  }
}
