import { Module } from '@nestjs/common';
import { CitoyenController } from './infrastructure/api/citoyen.controller';
import { CitoyenUsecase } from './usecase/citoyen.usecase';
import { CitoyenRepository } from './infrastructure/repository/citoyen.repository';
import { PrismaService } from './infrastructure/db/prisma.service';
import { HelloworldController } from './infrastructure/api/helloworld.controller';

@Module({
  imports: [],
  controllers: [CitoyenController, HelloworldController],
  providers: [CitoyenUsecase,CitoyenRepository, PrismaService],
})
export class AppModule {}
