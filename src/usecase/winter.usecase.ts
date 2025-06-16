import { Injectable } from '@nestjs/common';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class WinterUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  public async connect_by_address(
    utilisateurId: string,
    nom: string,
    adresse: string,
    code_postal: string,
    code_commune: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);
  }
}
