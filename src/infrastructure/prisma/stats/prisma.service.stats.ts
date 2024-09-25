import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../stats/prisma_client_stats';

@Injectable()
export class PrismaServiceStat extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
