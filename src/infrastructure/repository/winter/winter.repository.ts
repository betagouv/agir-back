import { Injectable } from '@nestjs/common';
import { App } from '../../../domain/app';
import { ApplicationError } from '../../applicationError';
import { CommuneRepository } from '../commune/commune.repository';
import { WinterAction, WinterAPIClient } from './winterAPIClient';

@Injectable()
export class WinterRepository {
  constructor(
    private commune_repo: CommuneRepository,
    private winterAPIClient: WinterAPIClient,
  ) {}

  public async rechercherPRMParAdresse(
    nom: string,
    adresse: string,
    code_commune: string,
    code_postal: string,
  ): Promise<string> {
    if (App.isWinterFaked()) {
      return '12345678901234';
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    const commune = this.commune_repo.getCommuneByCodeINSEE(code_commune);
    if (!commune) {
      ApplicationError.throwCodeCommuneNotFound(code_commune);
    }

    const liste_prms = await this.winterAPIClient.searchPRM(
      nom,
      adresse,
      code_postal,
      commune.nom,
    );

    if (liste_prms.length !== 1) {
      ApplicationError.throwNoPRMFoundAtAddress(
        `${nom}, ${adresse}, ${code_postal} ${commune.nom}`,
      );
    }

    return liste_prms[0].prm;
  }

  public async inscrirePRM(
    prm: string,
    nom: string,
    user_id: string,
    ip: string,
    user_agent: string,
    version_consentement: string,
  ): Promise<void> {
    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    await this.winterAPIClient.inscrirePRM(
      prm,
      nom,
      user_id,
      ip,
      user_agent,
      version_consentement,
    );
  }

  public async supprimerPRM(user_id: string): Promise<void> {
    if (App.isWinterFaked()) {
      return;
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    await this.winterAPIClient.supprimerPRM(user_id);
  }

  public async listerActionsWinter(user_id: string): Promise<WinterAction[]> {
    if (App.isWinterFaked()) {
      return [];
    }

    if (!App.isWinterAPIEnabled()) {
      ApplicationError.throwWinterDisabled();
    }

    const reponse = await this.winterAPIClient.listerActions(user_id);

    return reponse.actionStateProxyResponse;
  }
}
