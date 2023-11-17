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

  async listGroupes(): Promise<Groupe[]> {
    return this.groupeRepository.listGroupes();
  }

  async createGroupeWithAdmin(
    name: string,
    description: string,
    utilisateurId: string,
  ): Promise<Groupe> {
    const groupe = await this.groupeRepository.createGroupe(
      new Groupe({ name, description }),
    );
    await this.groupeRepository.addAdmin(groupe.id, utilisateurId);
    return groupe;
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
    const isAdmin = await this.groupeRepository.isAdminOfGroupe(
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
  ): Promise<Groupe> {
    // check if those group is mine
    const isAdmin = await this.groupeRepository.isAdminOfGroupe(
      utilisateurId,
      groupeId,
    );
    if (!isAdmin) throw new Error('User is not admin of this group');
    // delete membres
    await this.groupeRepository.removeAllUtilisateursFromGroupe(groupeId);
    // delete group
    return await this.groupeRepository.deleteGroupe(groupeId);
  }

  async groupesByUtilisateurId(utilisateurId: string): Promise<Groupe[]> {
    return this.groupeRepository.getGroupesByUtilisateurId(utilisateurId);
  }

  async joinGroupe(
    groupeId: string,
    utilisateurId: string,
  ): Promise<GroupeAbonnement> {
    return this.groupeRepository.addMember(groupeId, utilisateurId);
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
