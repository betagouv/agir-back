import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Request } from '@nestjs/common';
import { GenericControler } from './genericControler';
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan')
export class BilanCarboneController extends GenericControler {
  constructor(private readonly bilanCarboneUsecase: BilanCarboneUsecase) {
    super();
  }

  @Post('utilisateurs/compute_bilan_carbone')
  async computeBilanTousUtilisateurs(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.bilanCarboneUsecase.computeBilanTousUtilisateurs();
  }
}
