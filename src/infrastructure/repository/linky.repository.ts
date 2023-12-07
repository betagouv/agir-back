import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LinkyData } from '../../../src/domain/linky/linkyData';

@Injectable()
export class LinkyRepository {
  constructor(private prisma: PrismaService) {}

  async createNewLinky(linky_data: LinkyData) {
    await this.prisma.linky.create({
      data: {
        id: uuidv4(),
        prm: linky_data.prm,
        pk_winter: linky_data.pk_winter,
        data: linky_data.serie as any,
      },
    });
  }

  async updateData(linky_data: LinkyData): Promise<void> {
    await this.prisma.linky.update({
      where: {
        prm: linky_data.prm,
      },
      data: {
        data: linky_data.serie as any,
      },
    });
  }
  async getLinky(prm: string): Promise<LinkyData> {
    const result = await this.prisma.linky.findUnique({
      where: {
        prm: prm,
      },
    });
    if (result === null) {
      return null;
    }
    return new LinkyData({
      prm: result.prm,
      pk_winter: result.pk_winter,
      serie: result.data as any,
    });
  }
  async emptyData(prm: string): Promise<void> {
    await this.prisma.linky.update({
      where: {
        prm: prm,
      },
      data: {
        data: [],
      },
    });
  }
  async deleteLinky(prm: string): Promise<void> {
    await this.prisma.linky.delete({
      where: {
        prm: prm,
      },
    });
  }
}
