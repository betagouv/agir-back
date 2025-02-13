import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OIDCState } from '../auth/oidcState';

@Injectable()
export class OIDCStateRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId) {
      await this.prisma.oIDC_STATE.deleteMany({ where: { utilisateurId } });
    }
  }

  async createNewState(data: OIDCState) {
    return this.prisma.oIDC_STATE.create({
      data,
    });
  }
  async getByUtilisateurId(utilisateurId: string): Promise<OIDCState | null> {
    return await this.prisma.oIDC_STATE.findUnique({
      where: {
        utilisateurId,
      },
    });
  }
  async getByState(state: string): Promise<OIDCState | null> {
    return await this.prisma.oIDC_STATE.findUnique({
      where: {
        state: state,
      },
    });
  }

  async deleteByUtilisateurId(utilisateurId: string) {
    return this.prisma.oIDC_STATE.deleteMany({
      where: {
        utilisateurId,
      },
    });
  }
  async updateState(data: OIDCState) {
    return this.prisma.oIDC_STATE.update({
      where: {
        state: data.state,
      },
      data,
    });
  }
}
