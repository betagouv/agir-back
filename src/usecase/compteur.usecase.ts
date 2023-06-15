import { Injectable } from '@nestjs/common';
import { Compteur } from '@prisma/client';
import { CompteurRepository } from '../infrastructure/repository/compteur.repository';

@Injectable()
export class CompteurUsecase {
  constructor(private compteurRepository: CompteurRepository) {}

  async getById(id: string): Promise<Compteur> {
    return this.compteurRepository.getById(id);
  }
  async create(titre: string, valeur: string, utilisateurId: string): Promise<Compteur> {
    return this.compteurRepository.create(titre, valeur, utilisateurId);
  }
  async list(): Promise<Compteur[]> {
    return this.compteurRepository.list();
  }
}
