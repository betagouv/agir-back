import { Utilisateur } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UtilisateurUsecase {
  constructor(private utilisaturRespository: UtilisateurRepository) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisaturRespository.findUtilisateursByName(name);
  }
  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisaturRespository.findUtilisateurByEmail(email);
  }
  async createUtilisateurByName(name: string): Promise<Utilisateur> {
    return this.utilisaturRespository.createUtilisateurByName(name);
  }
  async createUtilisateurByOptionalNameAndEmail(
    name: string,
    email: string,
  ): Promise<Utilisateur> {
    return this.utilisaturRespository.createUtilisateur({
      name: name || 'John Doe '.concat(uuidv4()),
      email: email,
    });
  }
  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisaturRespository.findUtilisateurById(id);
  }
  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisaturRespository.listUtilisateur();
  }
}
