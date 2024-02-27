import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { WinterDataSentAPI } from '../../src/infrastructure/api/types/winter/WinterIncomingDataAPI';
import { LinkyRepository } from '../../src/infrastructure/repository/linky.repository';
import { LinkyData } from '../../src/domain/linky/linkyData';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { AsyncService } from '../../src/domain/service/serviceDefinition';
import { LinkyDataDetailAPI } from '../../src/infrastructure/api/types/service/linkyDataAPI';
import { LinkyAPIConnector } from '../../src/infrastructure/service/linky/LinkyAPIConnector';

@Injectable()
export class LinkyUsecase {
  constructor(
    private linkyRepository: LinkyRepository,
    private serviceRepository: ServiceRepository,
    private linkyAPIConnector: LinkyAPIConnector,
  ) {}

  async unsubscribeOrphanPRMs(): Promise<string[]> {
    const result = [];
    const orphans = await this.linkyRepository.findWinterPKsOrphanEntries();

    for (let index = 0; index < orphans.length; index++) {
      const orphan = orphans[index];
      try {
        await this.linkyAPIConnector.deleteSouscription(orphan.winter_pk);
        await this.linkyRepository.delete(orphan.prm);
        result.push(
          `DELETED orphan winter_pk:${orphan.winter_pk} / prm:${orphan.prm} / user:${orphan.utilisateurId}`,
        );
      } catch (error) {
        if (error.code === '037') {
          await this.linkyRepository.delete(orphan.prm);
          result.push(
            `ALREADY unsubscribed winter_pk:${orphan.winter_pk} / prm:${orphan.prm} / user:${orphan.utilisateurId}`,
          );
        } else {
          result.push(
            `ERROR unsubscribing winter_pk:${orphan.winter_pk} / prm:${orphan.prm} / user:${orphan.utilisateurId} => ${error.code}/${error.message}`,
          );
        }
      }
    }
    return result;
  }

  async cleanLinkyData(): Promise<number> {
    const prm_list = await this.linkyRepository.getAllPRMs();
    for (let index = 0; index < prm_list.length; index++) {
      const prm = prm_list[index];

      const linky_data = await this.linkyRepository.getByPRM(prm);

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
    derniers_14_jours: boolean,
  ): Promise<{ data: LinkyData; commentaires?: string[] }> {
    const serviceLinky = await this.serviceRepository.getServiceOfUtilisateur(
      utilisateurId,
      AsyncService.linky,
    );
    if (!serviceLinky) return { data: new LinkyData() };

    const linkyData = await this.linkyRepository.getByPRM(
      serviceLinky.configuration['prm'],
    );
    if (!linkyData) return { data: new LinkyData() };

    if (compare_annees) {
      const result = linkyData.compare2AnsParMois();
      linkyData.serie = result.data;
      return { data: linkyData, commentaires: result.commentaires };
    }
    if (derniers_14_jours) {
      const result = linkyData.compare14joursEntre2ans();
      linkyData.serie = result.data;
      return { data: linkyData, commentaires: result.commentaires };
    }

    if (detail === LinkyDataDetailAPI.jour && nombre) {
      linkyData.serie = linkyData.extractLastNDays(nombre);
      return { data: linkyData };
    }
    if (detail === LinkyDataDetailAPI.semaine && nombre) {
      linkyData.serie = linkyData.extractLastNWeeks(nombre);
      return { data: linkyData };
    }
    if (detail === LinkyDataDetailAPI.mois && nombre) {
      linkyData.serie = linkyData.extractLastNMonths(
        nombre,
        end_date ? new Date(end_date) : new Date(),
      );
      return { data: linkyData };
    }
    return { data: linkyData };
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

    let current_data = await this.linkyRepository.getByPRM(prm);
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
