import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { WinterDataSentAPI } from '../../src/infrastructure/api/types/winter/WinterIncomingDataAPI';
import { LinkyServiceManager } from '../../src/infrastructure/service/linky/LinkyServiceManager';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { LinkyRepository } from '../../src/infrastructure/repository/linky.repository';

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

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    if (utilisateur.pk_winter) {
      ApplicationError.throwAlreadySubscribedError();
    }
    utilisateur.prm = prm;
    utilisateur.code_departement = code_departement;

    const pk = await this.linkyServiceManager.souscription(
      prm,
      code_departement,
    );
    utilisateur.pk_winter = pk;
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    await this.linkyRepository.createNewPRM(prm);
  }

  async liste_souscriptions(page?: number): Promise<any> {
    return this.linkyServiceManager.list_souscriptions(page);
  }

  async emptyPRMData(utilisateurId: string): Promise<any> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    await this.linkyRepository.emptyData(utilisateur.prm);
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

    await this.linkyRepository.updateData(prm, current_data);
  }
}
