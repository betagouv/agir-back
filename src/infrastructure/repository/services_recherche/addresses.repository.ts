import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/resultatRecherche';

const API_URL = 'https://api-adresse.data.gouv.fr/search';

//https://presdecheznous.gogocarto.fr/api/elements.json?limit=100&categories=&bounds=1.69739 41.93845 2.68343 43.14308
export type AddresseResponse = {
  type: string;
  version: string;
  features: {
    type: string;
    geometry: { type: string; coordinates: [number, number] };
    properties: {
      label: string; // libellé complet de l’adresse
      score: number;
      id: '91477';
      type: 'housenumber' | 'street' | 'locality' | 'municipality';
      /*
        housenumber : numéro « à la plaque »
        street : position « à la voie », placé approximativement au centre de celle-ci
        locality : lieu-dit
        municipality : numéro « à la commune »
      */
      name: string; // numéro éventuel et nom de voie ou lieu dit
      postcode: string; // code postal
      citycode: string; // code INSEE de la commune
      x: 643535.01; // coordonnées géographique en projection légale
      y: 6846532.14; //coordonnées géographique en projection légale
      population: number;
      city: string;
      context: string; // n° de département, nom de département et de région
      importance: number;
      municipality: string;
    };
  }[];
};

@Injectable()
export class AddressesRepository implements FinderInterface {
  public getManagedCategories(): CategorieRecherche[] {
    return [];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const result = await this.callAddresseAPI(filtre.text);

    if (result.features.length === 0) {
      return null;
    }
    const feature = result.features[0];
    return [
      new ResultatRecherche({
        id: feature.properties.id,
        titre: feature.properties.label,
        site_web: null,
        adresse_rue: feature.properties.name,
        adresse_nom_ville: feature.properties.city,
        adresse_code_postal: feature.properties.postcode,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      }),
    ];
  }

  private async callAddresseAPI(text: string): Promise<AddresseResponse> {
    let response;
    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: { q: text, limit: 1 },
      });
    } catch (error) {
      if (error.response) {
        // haha
      } else if (error.request) {
        // hihi
      }
      return null;
    }
    return response.data;
  }
}
