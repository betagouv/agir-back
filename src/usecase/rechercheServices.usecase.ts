import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ServiceRechercheID } from '../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRecherche } from '../../src/domain/bibliotheque_services/resultatRecherche';
import { RechercheServiceManager } from '../../src/domain/bibliotheque_services/serviceManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { FiltreRecherche } from '../domain/bibliotheque_services/filtreRecherche';

@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
  ) {}

  async search(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    categorie: string,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    if (!finder) {
      ApplicationError.throwUnkonwnSearchService(serviceId);
    }
    if (!utilisateur.logement.code_postal) {
      ApplicationError.throwUnkonwnUserLocation();
    }

    const result = await finder.find(
      categorie,
      new FiltreRecherche({
        code_postal: utilisateur.logement.code_postal,
        commune: utilisateur.logement.commune,
      }),
    );

    return result;
  }
  async getFavoris(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    return [
      {
        id: 'DwG',
        titre: "Mon Epice'Rit",
        adresse_code_postal: '91120',
        adresse_nom_ville: 'Palaiseau',
        adresse_rue: '4 Rue des Écoles',
        site_web: 'https://www.monepi.fr/monepicerit',
      },
      {
        id: 'NTw',
        titre: "L'ébullition",
        adresse_code_postal: '91120',
        adresse_nom_ville: 'Palaiseau',
        adresse_rue: '2 Avenue de la République',
        site_web: 'http://www.palaiseautierslieu.fr',
      },
      {
        id: 'D3U',
        titre: 'L’Auvergnat Bio',
        adresse_code_postal: '91120',
        adresse_nom_ville: 'Palaiseau',
        adresse_rue: '150 Rue de Paris',
        site_web: 'https://www.auvergnat-bio.com/',
      },
    ];
  }
}
