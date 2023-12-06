import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LinkyData } from '../../../src/domain/linky/linkyData';

@Injectable()
export class LinkyRepository {
  constructor(private prisma: PrismaService) {}

  async createNewPRM(prm: string) {
    await this.prisma.linky.create({
      data: {
        id: uuidv4(),
        prm: prm,
        data: new LinkyData({ serie: [] }) as any,
      },
    });
  }

  async updateData(prm: string, data: LinkyData): Promise<void> {
    await this.prisma.linky.update({
      where: {
        prm: prm,
      },
      data: {
        data: data as any,
      },
    });
  }
  async getData(prm: string): Promise<LinkyData> {
    const result = await this.prisma.linky.findUnique({
      where: {
        prm: prm,
      },
    });
    return new LinkyData(result.data as any);
  }
  async emptyData(prm: string): Promise<void> {
    await this.prisma.linky.update({
      where: {
        prm: prm,
      },
      data: {
        data: new LinkyData() as any,
      },
    });
  }
}
