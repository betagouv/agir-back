import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { WinterDataSentAPI } from '../../src/infrastructure/api/types/winter/WinterIncomingDataAPI';
import { LinkyRepository } from '../../src/infrastructure/repository/linky.repository';
import { LinkyData } from '../../src/domain/linky/linkyData';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { AsyncService } from '../../src/domain/service/serviceDefinition';
import { LinkyDataDetailAPI } from '../../src/infrastructure/api/types/service/linkyDataAPI';

@Injectable()
export class LinkyUsecase {
  constructor(
    private linkyRepository: LinkyRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  async cleanLinkyData(): Promise<number> {
    const prm_list = await this.linkyRepository.getAllPRMs();
    for (let index = 0; index < prm_list.length; index++) {
      const prm = prm_list[index];

      const linky_data = await this.linkyRepository.getLinky(prm);

      linky_data.cleanData();

      await this.linkyRepository.upsertData(linky_data);
    }
    return prm_list.length;
  }

  async getUserData(
    utilisateurId: string,
    detail: LinkyDataDetailAPI,
    nombre: number,
    end_date: string,
    compare_annees: boolean,
    compare_mois_sem_jour: boolean,
  ): Promise<LinkyData> {
    const serviceLinky = await this.serviceRepository.getServiceOfUtilisateur(
      utilisateurId,
      AsyncService.linky,
    );
    if (!serviceLinky) return new LinkyData();

    const linkyData = await this.linkyRepository.getLinky(
      serviceLinky.configuration['prm'],
    );
    if (!linkyData) return new LinkyData();

    if (compare_annees) {
      linkyData.serie = linkyData.compare2AnsParMois();
      return linkyData;
    }
    if (compare_mois_sem_jour) {
      linkyData.serie = linkyData.dynamicCompareTwoYears();
      return linkyData;
    }

    if (detail === LinkyDataDetailAPI.jour && nombre) {
      linkyData.serie = linkyData.extractLastNDays(nombre);
      return linkyData;
    }
    if (detail === LinkyDataDetailAPI.semaine && nombre) {
      linkyData.serie = linkyData.extractLastNWeeks(nombre);
      return linkyData;
    }
    if (detail === LinkyDataDetailAPI.mois && nombre) {
      linkyData.serie = linkyData.extractLastNMonths(
        nombre,
        end_date ? new Date(end_date) : new Date(),
      );
      return linkyData;
    }
    return linkyData;
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

    let current_data = await this.linkyRepository.getLinky(prm);
    if (!current_data) {
      current_data = new LinkyData({ prm: prm, serie: [] });
    }

    for (let index = 0; index < incoming.data.length; index++) {
      const element = incoming.data[index];
      current_data.addDataElement({
        time: new Date(element.utc_timestamp),
        value: element.value,
        value_at_normal_temperature: element.value_at_normal_temperature,
      });
    }

    await this.linkyRepository.upsertData(current_data);
  }
}
