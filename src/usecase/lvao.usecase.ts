import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { ActeurLVAO, ActionLVAO } from '../domain/lvao/ActeurLVAO';
import { LVAORepository } from '../infrastructure/repository/lvao.repository';

type LVAO_CSV_ROW = {
  identifiant: string; //'222dMMK2fP52fhyhjJcYMY',
  paternite: string; //'Longue Vie Aux Objets|ADEME|CRAR Normandie',
  nom: string; //'Repair Café Elbeuf-sur-Seine',
  nom_commercial: string; //'',
  siren: string; //'',
  siret: string; // "81794744300021",
  description: string; //'',
  type_dacteur: string; //'ess',
  site_web: string; //'https://www.mairie-elbeuf.fr/reouverture-du-repair-cafe/',
  telephone: string; //'',
  adresse: string; //'14\t\true \tde la République',
  complement_dadresse: string; //'Petit Atelier',
  code_postal: string; // '76500',
  ville: string; //'Elbeuf',
  latitude: string; //'49.290368251444505',
  longitude: string; //'1.001683363974231',
  qualites_et_labels: string; //'ess',
  public_accueilli: string; //'',
  reprise: string; //'',
  exclusivite_de_reprisereparation: string; //'',
  uniquement_sur_rdv: string; //'',
  type_de_services: string; //'atelier_pour_reparer_soi_meme',
  propositions_de_services: string; //'[{"action": "reparer", "sous_categories": ["luminaire", "materiel hifi et video", "vetement", "materiel informatique", "velo", "petit electromenager"]}]',
  emprunter: string; //'',
  preter: string; //'',
  louer: string; //'',
  mettreenlocation: '';
  reparer: string; //'luminaire|materiel hifi et video|materiel informatique|petit electromenager|velo|vetement',
  donner: string; //'',
  trier: string; //'',
  echanger: string; //'',
  revendre: string; //'',
  acheter: string; //'',
  date_de_derniere_modification: string; //'2024-06-17'
};

@Injectable()
export class LVAOUsecase {
  constructor(private lvaoRepository: LVAORepository) {}

  public async upsert_acteur(acteur: ActeurLVAO): Promise<void> {
    await this.lvaoRepository.upsert_acteur(acteur);
  }

  public async smart_load_csv_lvao(csvFilePath: string) {
    console.log('YYOOO');
    console.log(csvFilePath);

    const CsvReadableStream = require('csv-reader');

    let inputStream = fs.createReadStream(csvFilePath, 'utf8');

    const _this = this;
    await new Promise((resolve, reject) => {
      inputStream
        .pipe(
          new CsvReadableStream({
            parseNumbers: false,
            parseBooleans: true,
            trim: true,
            asObject: true,
          }),
        )
        .on('data', function (row: LVAO_CSV_ROW) {
          console.log(_this.parse_acteur_CSV(row));
        })
        .on('error', function (err) {
          console.log(err);
          reject(err);
        })
        .on('end', function () {
          console.log('No more rows!');
          resolve({});
        });
    });
  }

  private parse_acteur_CSV(row: LVAO_CSV_ROW): ActeurLVAO {
    const result = new ActeurLVAO({
      acheter: this.splitOrEmptyArray(row.acheter),
      adresse: row.adresse,
      code_postal: row.code_postal,
      complement_adresse: row.complement_dadresse,
      date_derniere_maj: new Date(row.date_de_derniere_modification),
      description: row.description,
      detail_services: this.parsePropDeService(row.propositions_de_services),
      donner: this.splitOrEmptyArray(row.donner),
      echanger: this.splitOrEmptyArray(row.echanger),
      emprunter: this.splitOrEmptyArray(row.emprunter),
      id: row.identifiant,
      labels: this.splitOrEmptyArray(row.qualites_et_labels),
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      louer: this.splitOrEmptyArray(row.louer),
      mettreenlocation: this.splitOrEmptyArray(row.mettreenlocation),
      nom: row.nom,
      nom_commercial: row.nom_commercial,
      preter: this.splitOrEmptyArray(row.preter),
      reparer: this.splitOrEmptyArray(row.reparer),
      reprise: row.reprise,
      reprise_exclusif: row.exclusivite_de_reprisereparation !== 'f',
      revendre: this.splitOrEmptyArray(row.revendre),
      siren: row.siren,
      siret: row.siret,
      sources: this.splitOrEmptyArray(row.paternite),
      sur_rdv: row.uniquement_sur_rdv !== 'f',
      telephone: row.telephone,
      trier: this.splitOrEmptyArray(row.trier),
      type_acteur: row.type_dacteur,
      type_public: row.public_accueilli,
      types_service: this.splitOrEmptyArray(row.type_de_services),
      url: row.site_web,
      ville: row.ville,
    });

    return result;
  }

  private parsePropDeService(props: string): ActionLVAO[] {
    return JSON.parse(props) as ActionLVAO[];
  }

  private splitOrEmptyArray(data: string): string[] {
    if (data.indexOf('|') > -1) {
      return data.split('|');
    }
    if (data.length > 0) {
      return [data];
    }
    return [];
  }
}
