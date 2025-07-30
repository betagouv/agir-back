import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Adresse, AdresseData } from '../domain/logement/adresse';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

const NBR_MAX_ADRESSES = 5;

@Injectable()
export class AdresseUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  public async getListeAdressesRecentes(
    utilisateurId: string,
  ): Promise<Adresse[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    return utilisateur.logement.liste_adresses_recentes;
  }

  public async addAdressesRecentes(
    utilisateurId: string,
    input_adresse: AdresseData,
  ): Promise<Adresse[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const adresse = new Adresse(input_adresse);

    if (
      utilisateur.logement.liste_adresses_recentes.length >
      NBR_MAX_ADRESSES - 1
    ) {
      ApplicationError.throwTropAdressesRecentes(NBR_MAX_ADRESSES);
    }

    adresse.checkAllFieldsMandatory();
    adresse.checkAllFieldsSize();
    adresse.checkCoordinatesOK();
    adresse.checkCodeCommuneAndCodePostalCoherent();

    adresse.id = uuidv4();
    adresse.date_creation = new Date();

    utilisateur.logement.liste_adresses_recentes.push(adresse);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement],
    );

    return utilisateur.logement.liste_adresses_recentes;
  }
  public async supprimeAdresseRecente(
    utilisateurId: string,
    adresseId: string,
  ): Promise<Adresse[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const indexAdresse = utilisateur.logement.liste_adresses_recentes.findIndex(
      (a) => a.id === adresseId,
    );

    if (indexAdresse >= 0) {
      utilisateur.logement.liste_adresses_recentes.splice(indexAdresse, 1);
    }

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement],
    );

    return utilisateur.logement.liste_adresses_recentes;
  }
}
