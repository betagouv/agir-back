import {
  Controller,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { PrismaService } from '../prisma/prisma.service';
import { ControllerExceptionFilter } from './controllerException.filter';
const _services = require('../../../test_data/_services');
import { GenericControler } from './genericControler';

@Controller()
@ApiBearerAuth()
@ApiTags('Admin')
export class AdminController extends GenericControler {
  constructor(private prisma: PrismaService) {
    super();
  }

  @Post('/admin/insert_service_definitions')
  @ApiOperation({
    summary:
      'Upsert toutes les définitions de services à partir du fichier /test_data/_services.ts',
  })
  @UseGuards(AuthGuard)
  async upsertAllServices(@Request() req) {
    this.checkCallerIsAdmin(req);
    await this.upsertServicesDefinitions();
  }

  async upsertServicesDefinitions() {
    const keyList = Object.keys(_services);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = _services[serviceId];
      const data = { ...service };
      data.id = serviceId;
      await this.prisma.serviceDefinition.upsert({
        where: {
          id: serviceId,
        },
        update: data,
        create: data,
      });
    }
  }
}
