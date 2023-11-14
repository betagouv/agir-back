import { GroupeRepository } from '../infrastructure/repository/groupe.repository';
import { Groupe } from '../domain/groupe/groupe';
import { Injectable } from '@nestjs/common';
import { GroupeAbonnement } from '@prisma/client';

@Injectable()
export class GroupeUseCase {
  constructor(private groupeRepository: GroupeRepository) {}

  async listMyGroupes(utilisateurId): Promise<Groupe[]> {
    return this.groupeRepository.getGroupesByUtilisateurId(utilisateurId);
  }

  async createGroupeWithAdmin(
    name: string,
    description: string,
    utilisateurId: string,
  ): Promise<Groupe | false> {
    const groupe = await this.groupeRepository.createGroupe(
      new Groupe({ name, description }),
    );
    const result = this.groupeRepository.addUtilisateurToGroupe(
      groupe.id,
      utilisateurId,
      true,
    );
    // FIXME : exception plutôt que false
    return result ? groupe : false;
  }

  async getGroupeById(groupeId: string): Promise<Groupe> {
    return this.groupeRepository.getGroupeById(groupeId);
  }

  async updateOneOfMyGroupe(
    utilisateurId: string,
    groupeId: string,
    name: string,
    description: string,
  ): Promise<Groupe> {
    // check if those group is mine
    const isAdmin = await this.groupeRepository.utilisateurIsAdminOfGroupe(
      utilisateurId,
      groupeId,
    );
    if (!isAdmin) throw new Error('User is not admin of this group');
    return this.groupeRepository.updateGroupe(
      groupeId,
      new Groupe({ name, description }),
    );
  }

  async deleteOneOfMyGroupe(
    utilisateurId: string,
    groupeId: string,
  ): Promise<boolean> {
    // check if those group is mine
    const isAdmin = await this.groupeRepository.utilisateurIsAdminOfGroupe(
      utilisateurId,
      groupeId,
    );
    if (!isAdmin) throw new Error('User is not admin of this group');
    // delete group
    await this.groupeRepository.removeUtilisateurFromGroupe(
      groupeId,
      utilisateurId,
    );
    // FIXME : supprimer tous les membres du groupe avec de supprimer le groupe
    return await this.groupeRepository.deleteGroupe(groupeId);
  }

  async groupesByUtilisateurId(utilisateurId: string): Promise<Groupe[]> {
    return this.groupeRepository.getGroupesByUtilisateurId(utilisateurId);
  }

  // FIXME : supprimer le boolean, toujours join en mode non admin
  async joinGroupe(
    groupeId: string,
    utilisateurId: string,
    admin: boolean,
  ): Promise<GroupeAbonnement> {
    return this.groupeRepository.addUtilisateurToGroupe(
      groupeId,
      utilisateurId,
      admin || false,
    );
  }

  async removeUtilisateurFromGroupe(
    utilisateurId: string,
    groupId: string,
  ): Promise<GroupeAbonnement> {
    return this.groupeRepository.removeUtilisateurFromGroupe(
      groupId,
      utilisateurId,
    );
  }
}
