import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientStat } from './prisma_client_stats/index';

@Injectable()
export class PrismaServiceStat
  extends PrismaClientStat
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}
