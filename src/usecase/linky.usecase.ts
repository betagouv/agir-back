import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { WinterDataSentAPI } from '../../src/infrastructure/api/types/winter/WinterIncomingDataAPI';
import { LinkyServiceManager } from '../../src/infrastructure/service/linky/LinkyServiceManager';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { LinkyRepository } from '../../src/infrastructure/repository/linky.repository';
import { LinkyData } from '../../src/domain/linky/linkyData';

@Injectable()
export class LinkyUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private linkyRepository: LinkyRepository,
    private linkyServiceManager: LinkyServiceManager,
  ) {}

  async souscription(
    utilisateurId: string,
    prm: string,
    code_departement: string,
  ) {
    if (!prm) {
      ApplicationError.throwMissingPRM();
    }
    if (!code_departement) {
      ApplicationError.throwMissingCodeDepartement();
    }

    const existing_linky_data = await this.linkyRepository.getData(prm);

    if (existing_linky_data !== null) {
      ApplicationError.throwAlreadySubscribedError();
    }

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    utilisateur.prm = prm;
    utilisateur.code_departement = code_departement;

    const pk = await this.linkyServiceManager.souscription(
      prm,
      code_departement,
    );
    const new_linky_data = new LinkyData({
      prm: prm,
      pk_winter: pk,
      serie: [],
    });
    await this.linkyRepository.createNewPRMData(new_linky_data);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async liste_souscriptions(page?: number): Promise<any> {
    return this.linkyServiceManager.list_souscriptions(page);
  }

  async emptyPRMData(prm: string): Promise<any> {
    await this.linkyRepository.emptyData(prm);
  }

  async process_incoming_data(incoming: WinterDataSentAPI): Promise<any> {
    console.log(JSON.stringify(incoming));

    if (
      incoming.error &&
      incoming.error.code !== null &&
      incoming.error.code !== undefined
    ) {
      ApplicationError.throwLinkyError(
        incoming.error.code,
        incoming.error.message,
      );
    }
    const prm = incoming.info.prm;

    const current_data = await this.linkyRepository.getData(prm);

    for (let index = 0; index < incoming.data.length; index++) {
      const element = incoming.data[index];
      current_data.addDataElement({
        time: new Date(element.utc_timestamp),
        value: element.value,
        value_at_normal_temperature: element.value_at_normal_temperature,
      });
    }

    await this.linkyRepository.updateData(current_data);
  }
}
