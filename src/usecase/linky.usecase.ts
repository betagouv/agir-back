import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { WinterDataSentAPI } from '../../src/infrastructure/api/types/winter/WinterIncomingDataAPI';
import { LinkyServiceManager } from '../../src/infrastructure/service/linky/LinkyServiceManager';
import { LinkyRepository } from '../../src/infrastructure/repository/linky.repository';

@Injectable()
export class LinkyUsecase {
  constructor(
    private linkyRepository: LinkyRepository,
    private linkyServiceManager: LinkyServiceManager,
  ) {}

  async liste_souscriptions(page?: number): Promise<any> {
    return this.linkyServiceManager.list_souscriptions(page);
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

    const current_data = await this.linkyRepository.getLinky(prm);

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
