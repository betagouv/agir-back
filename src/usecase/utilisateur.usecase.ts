import { Utilisateur } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import {UtilisateurRepository} from '../infrastructure/repository/utilisateur.repository'

@Injectable()
export class UtilisateurUsecase {
  constructor(private utilisaturRespository: UtilisateurRepository) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisaturRespository.findUtilisateursByName(name);
  }
  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisaturRespository.findUtilisateurById(id);
  }
  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisaturRespository.listUtilisateur();
  }
}