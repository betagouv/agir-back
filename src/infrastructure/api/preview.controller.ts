import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { KycRepository } from '../repository/kyc.repository';
import { NGCCalculator } from '../ngc/NGCCalculator';
import { TypeReponseQuestionKYC } from '../../domain/kyc/questionKYC';

@Controller()
@ApiExcludeController()
export class PreviewController extends GenericControler {
  constructor(
    private kycRepository: KycRepository,
    private nGCCalculator: NGCCalculator,
  ) {
    super();
  }

  @Get('kyc_preview/:id')
  async refreshServiceDynamicData(@Param('id') id: string): Promise<string> {
    const kyc_def = await this.kycRepository.getByCMS_ID(parseInt(id));

    if (!kyc_def) {
      return 'Publiez la question avant de faire le preview ! o/s';
    }

    const result: any = {};

    result.IS_NGC = kyc_def.is_ngc;
    result.NGC_QUESTION_KEY = kyc_def.ngc_key;

    if (!kyc_def.is_ngc) {
      return `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    }

    try {
      const situation: any = {};
      const base_line =
        this.nGCCalculator.computeBilanFromSituation(
          situation,
        ).bilan_carbone_annuel;

      result.bilan_carbone_default = base_line;

      if (kyc_def.type === TypeReponseQuestionKYC.entier) {
        situation[kyc_def.ngc_key] = 1;
        const value_1 = this.nGCCalculator.computeBilanFromSituation(situation);
        situation[kyc_def.ngc_key] = 2;
        const value_2 = this.nGCCalculator.computeBilanFromSituation(situation);

        result.with_kyc_reponse_equal_1 =
          value_1.bilan_carbone_annuel +
          this.compareBilan(value_1.bilan_carbone_annuel, base_line);
        result.with_kyc_reponse_equal_2 =
          value_2.bilan_carbone_annuel +
          this.compareBilan(value_2.bilan_carbone_annuel, base_line);
      }

      if (kyc_def.type === TypeReponseQuestionKYC.choix_unique) {
        for (const reponse of kyc_def.reponses) {
          situation[kyc_def.ngc_key] = reponse.ngc_code;
          const value = this.nGCCalculator.computeBilanFromSituation(situation);
          result[`value_when_${reponse.code}`] =
            value.bilan_carbone_annuel +
            this.compareBilan(value.bilan_carbone_annuel, base_line);
        }
      }
    } catch (error) {
      result.error = error.message;
    }

    return `<pre>${JSON.stringify(result, null, 2)}</pre>`;
  }

  private compareBilan(value: number, bilan: number): string {
    if (value === bilan) {
      return ' /!\\ UNCHANGED';
    }
    if (value > bilan) {
      ' > DEFAULT de ' + Math.round(value - bilan) + ' kg';
    } else {
      ' < DEFAULT de ' + Math.round(bilan - value) + ' kg';
    }
  }
}
