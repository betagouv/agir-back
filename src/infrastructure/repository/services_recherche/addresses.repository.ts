import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/recherche/resultatRecherche';

const API_URL = 'https://data.geopf.fr/geocodage/search';

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

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const result = await this.callAddresseAPI(filtre.text);

    if (!result) {
      return null;
    }
    if (result.features.length === 0) {
      return null;
    }
    const feature = result.features[0];
    return [
      new ResultatRecherche({
        id: feature.properties.id,
        titre: feature.properties.label,
        adresse_rue: feature.properties.name,
        adresse_nom_ville: feature.properties.city,
        adresse_code_postal: feature.properties.postcode,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      }),
    ];
  }

  public async findLocationFromCodePostalCommune(
    code_postal: string,
    commune: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const adresse = await this.find(
      new FiltreRecherche({
        text: '' + code_postal + ' ' + commune,
      }),
    );

    if (!adresse || adresse.length === 0) {
      return null;
    }

    const the_adresse = adresse[0];

    return {
      latitude: the_adresse.latitude,
      longitude: the_adresse.longitude,
    };
  }

  private async callAddresseAPI(text: string): Promise<AddresseResponse> {
    let response;
    const call_time = Date.now();
    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: { q: text, limit: 1 },
      });
    } catch (error) {
      console.log(
        `Error calling [api-adresse.data.gouv.fr] after ${
          Date.now() - call_time
        } ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:api-adresse.data.gouv.fr:${Date.now() - call_time}`);
    return response.data;
  }
}
