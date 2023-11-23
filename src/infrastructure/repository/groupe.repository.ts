import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Groupe } from '../../domain/groupe/groupe';
import { GroupeAbonnement, Groupe as GroupeDB, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GroupeRepository {
  constructor(private prisma: PrismaService) {}

  async listGroupes(): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({});
  }

  async createGroupe(groupe: Groupe): Promise<Groupe> {
    const group = await this.prisma.groupe.create({
      data: {
        id: uuidv4(),
        name: groupe.name,
        description: groupe.description,
      },
    });
    return group;
  }

  async getGroupeById(groupeId: string): Promise<Groupe> {
    return this.prisma.groupe.findUnique({
      where: { id: groupeId },
    });
  }

  async updateGroupe(groupeId: string, group: Groupe): Promise<Groupe> {
    const result = await this.prisma.groupe.update({
      where: { id: groupeId },
      data: group,
    });
    return result;
  }

  async deleteGroupe(groupeId: string): Promise<Groupe> {
    return await this.prisma.groupe.delete({ where: { id: groupeId } });
  }

  async getGroupesByUtilisateurId(utilisateurId: string): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({
      where: {
        utilisateurs: {
          some: {
            utilisateur: {
              id: utilisateurId,
            },
          },
        },
      },
    });
  }

  async isAdminOfGroupe(
    utilisateurId: string,
    groupeId: string,
  ): Promise<boolean> {
    const result = await this.prisma.groupeAbonnement.findUnique({
      select: { utilisateurId: true },
      where: {
        groupeId_utilisateurId: {
          groupeId,
          utilisateurId,
        },
        admin: true,
      },
    });

    return result != null;
  }

  async getAdminsByGroupeId(groupeId: string): Promise<Groupe[]> {
    return this.prisma.groupe.findMany({
      where: {
        id: groupeId,
      },
      include: {
        utilisateurs: {
          where: {
            admin: true,
          },
          include: {
            utilisateur: true,
          },
        },
      },
    });
  }

  async addMember(
    groupeId: string,
    utilisateurId: string,
  ): Promise<GroupeAbonnement> {
    return this.addUtilisateurToGroupe(groupeId, utilisateurId, false);
  }

  async addAdmin(
    groupeId: string,
    utilisateurId: string,
  ): Promise<GroupeAbonnement> {
    return this.addUtilisateurToGroupe(groupeId, utilisateurId, true);
  }

  private async addUtilisateurToGroupe(
    groupeId: string,
    utilisateurId: string,
    admin: boolean,
  ): Promise<GroupeAbonnement> {
    // FIXME : remove 'connect', pas utile
    const result = await this.prisma.groupeAbonnement.create({
      data: {
        groupeId: groupeId,
        utilisateurId: utilisateurId,
        admin: admin,
      },
    });
    return result;
  }

  async removeUtilisateurFromGroupe(
    groupeId: string,
    utilisateurId: string,
  ): Promise<GroupeAbonnement> {
    const result = await this.prisma.groupeAbonnement.delete({
      where: {
        groupeId_utilisateurId: {
          groupeId,
          utilisateurId,
        },
      },
    });
    return result;
  }

  async removeAllUtilisateursFromGroupe(
    groupeId: string,
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.groupeAbonnement.deleteMany({
      where: {
        groupeId,
      },
    });
  }
}
