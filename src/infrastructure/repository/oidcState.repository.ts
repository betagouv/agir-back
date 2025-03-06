import { Injectable } from '@nestjs/common';
import { OIDCState } from '../auth/oidcState';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OIDCStateRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    if (utilisateurId) {
      await this.prisma.oIDC_STATE.deleteMany({ where: { utilisateurId } });
    }
  }

  async createNewState(
    state_id: string,
    nonce: string,
    situation_ngc_id?: string,
  ) {
    return this.prisma.oIDC_STATE.create({
      data: {
        state: state_id,
        nonce: nonce,
        situation_ngc_id: situation_ngc_id,
      },
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

  async setIdToken(state_id: string, id_token: string) {
    return this.prisma.oIDC_STATE.update({
      where: {
        state: state_id,
      },
      data: {
        idtoken: id_token,
      },
    });
  }

  async setUniqueUtilisateurId(state_id: string, utilisateurId: string) {
    // Suppression d'un ancien état si existant pour l'utilisateur
    await this.delete(utilisateurId);

    // Nouvel id utilisateur
    await this.setUtilisateurId(state_id, utilisateurId);
  }

  private async setUtilisateurId(state_id: string, utilisateurId: string) {
    return this.prisma.oIDC_STATE.update({
      where: {
        state: state_id,
      },
      data: {
        utilisateurId: utilisateurId,
      },
    });
  }
}
