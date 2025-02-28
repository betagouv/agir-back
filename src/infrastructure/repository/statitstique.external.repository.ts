import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { PrismaServiceStat } from '../prisma/stats/prisma.service.stats';

@Injectable()
export class StatistiqueExternalRepository {
  constructor(private prismaStats: PrismaServiceStat) {}

  public async deleteAllUserData() {
    await this.prismaStats.utilisateurCopy.deleteMany();
  }

  public async createUserData(utilisateur: Utilisateur) {
    await this.prismaStats.utilisateurCopy.create({
      data: {
        id: utilisateur.external_stat_id,

        code_insee_commune: utilisateur.code_commune,
        code_postal: utilisateur.logement.code_postal,
        nom_commune: utilisateur.logement.commune,

        nombre_points: utilisateur.gamification.points,

        nombre_parts_fiscales: utilisateur.parts,
        revenu_fiscal: utilisateur.revenu_fiscal,

        source_inscription: utilisateur.source_inscription,
        compte_actif: utilisateur.active_account,
        date_derniere_activite: utilisateur.derniere_activite,
      },
    });
  }
}
