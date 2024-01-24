import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkyData } from '../../../src/domain/linky/linkyData';

@Injectable()
export class LinkyRepository {
  constructor(private prisma: PrismaService) {}

  async upsertData(linky_data: LinkyData): Promise<void> {
    await this.prisma.linky.upsert({
      where: {
        prm: linky_data.prm,
      },
      create: {
        prm: linky_data.prm,
        data: linky_data.serie as any,
      },
      update: {
        data: linky_data.serie as any,
      },
    });
  }
  async getAllPRMs(): Promise<string[]> {
    const result = await this.prisma.linky.findMany({
      select: {
        prm: true,
      },
    });
    return result.map((entry) => entry['prm']);
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
      serie: result.data as any,
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
