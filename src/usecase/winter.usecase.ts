import { Injectable } from '@nestjs/common';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterRepository } from '../infrastructure/repository/winter/winter.repository';

const PRM_REGEXP = new RegExp('^[0123456789]{14}$');

@Injectable()
export class WinterUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private winterRepository: WinterRepository,
  ) {}

  public async connect_by_address(
    utilisateurId: string,
    nom: string,
    adresse: string,
    code_postal: string,
    code_commune: string,
    prm?: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let target_prm: string;

    if (prm) {
      if (!PRM_REGEXP.test(prm)) {
        ApplicationError.throwBadPRM(prm);
      }
      target_prm = prm;
    } else {
      if (!nom) {
        ApplicationError.throwNomObligatoireError();
      }
      if (!code_postal || !code_commune) {
        ApplicationError.throwCodePostalCommuneMandatory();
      }
      if (!adresse) {
        ApplicationError.throwUserMissingAdresseForPrmSearch();
      }
      target_prm = await this.winterRepository.rechercherPRMParAdresse(
        nom,
        adresse,
        code_commune,
        code_postal,
      );
    }

    await this.winterRepository.inscrirePRM(
      target_prm,
      nom,
      utilisateurId,
      '127.0.0.1',
      'agent',
      'v1',
    );

    utilisateur.logement.prm = target_prm;

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement],
    );
  }
}
