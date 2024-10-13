import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Classement } from '../../domain/gamification/classement';
import { Utilisateur } from '@prisma/client';
import { Pourcentile } from '../../domain/gamification/board';

@Injectable()
export class UtilisateurBoardRepository {
  constructor(private prisma: PrismaService) {}

  async top_trois_user(): Promise<Classement[]> {
    const top = await this.prisma.utilisateur.findMany({
      take: 3,
      orderBy: { points_classement: 'desc' },
      where: {
        est_valide_pour_classement: true,
      },
    });
    return top.map((t) => this.mapUserDbToDomain(t));
  }

  async top_trois_commune_user(
    code_postal: string,
    commune: string,
  ): Promise<Classement[]> {
    const top = await this.prisma.utilisateur.findMany({
      take: 3,
      where: {
        code_postal_classement: code_postal,
        commune_classement: commune,
        est_valide_pour_classement: true,
      },
      orderBy: { points_classement: 'desc' },
    });
    return top.map((t) => this.mapUserDbToDomain(t));
  }

  async update_rank_user_france() {
    const query = `
    WITH tmp as (
      SELECT
        "id",  
        DENSE_RANK() OVER ( ORDER BY points_classement DESC) AS rnk
      FROM
        "Utilisateur"
      WHERE
        "est_valide_pour_classement" = TRUE
    )
    UPDATE
      "Utilisateur"
    SET
      rank = tmp.rnk
    FROM
      tmp
    WHERE
    "Utilisateur"."id" = tmp."id";`;
    await this.prisma.$queryRawUnsafe(query);
  }

  async update_rank_user_commune() {
    const query = `
    WITH tmp as (
      SELECT
        "id",  
        DENSE_RANK() OVER ( PARTITION BY "code_postal_classement", "commune_classement" ORDER BY points_classement DESC) AS rnk
      FROM
        "Utilisateur"
      WHERE
        "est_valide_pour_classement" = TRUE
    )
    UPDATE
      "Utilisateur"
    SET
      rank_commune = tmp.rnk
    FROM
      tmp
    WHERE
    "Utilisateur"."id" = tmp."id";`;
    await this.prisma.$queryRawUnsafe(query);
  }

  async utilisateur_classement_proximite(
    rank: number,
    nombre: number,
    position: 'rank_avant_strict' | 'rank_apres_ou_egal',
    scope: 'national' | 'local',
    code_postal: string,
    commune: string,
    exclude_user_id?: string,
  ): Promise<Classement[]> {
    let rank_cond;
    if (position === 'rank_apres_ou_egal') {
      if (scope === 'national') {
        rank_cond = { rank: { gte: rank } };
      } else {
        rank_cond = { rank_commune: { gte: rank } };
      }
    } else {
      if (scope === 'national') {
        rank_cond = { rank: { lt: rank } };
      } else {
        rank_cond = { rank_commune: { lt: rank } };
      }
    }

    let user_cond;
    if (exclude_user_id) {
      user_cond = {
        not: exclude_user_id,
      };
    }

    let orderBy;
    if (scope === 'national') {
      orderBy = {
        orderBy: {
          rank: position === 'rank_apres_ou_egal' ? 'asc' : 'desc',
        },
      };
    } else {
      orderBy = {
        orderBy: {
          rank_commune: position === 'rank_apres_ou_egal' ? 'asc' : 'desc',
        },
      };
    }

    let filtre_commune = {};
    if (scope === 'local') {
      filtre_commune = {
        code_postal_classement: code_postal,
        commune_classement: commune,
      };
    }

    const result = await this.prisma.utilisateur.findMany({
      take: nombre,
      ...orderBy,
      where: {
        ...rank_cond,
        id: user_cond,
        ...filtre_commune,
        est_valide_pour_classement: true,
      },
    });

    if (scope === 'national') {
      result.sort((a, b) => a.rank - b.rank);
    } else {
      result.sort((a, b) => a.rank_commune - b.rank_commune);
    }

    return result.map((t) => this.mapUserDbToDomain(t));
  }
  async getPourcentile(
    points: number,
    code_postal?: string,
    commune?: string,
  ): Promise<Pourcentile> {
    let count_total;
    let count_better_than_user;
    if (code_postal) {
      count_total = await this.prisma.utilisateur.count({
        where: {
          code_postal_classement: code_postal,
          commune_classement: commune,
          est_valide_pour_classement: true,
        },
      });
      count_better_than_user = await this.prisma.utilisateur.count({
        where: {
          code_postal_classement: code_postal,
          commune_classement: commune,
          points_classement: {
            gt: points,
          },
          est_valide_pour_classement: true,
        },
      });
    } else {
      count_total = await this.prisma.utilisateur.count();
      count_better_than_user = await this.prisma.utilisateur.count({
        where: {
          points_classement: {
            gt: points,
          },
          est_valide_pour_classement: true,
        },
      });
    }
    const ratio = Math.round((count_better_than_user / count_total) * 100);
    if (ratio <= 5) return Pourcentile.pourcent_5;
    if (ratio <= 10) return Pourcentile.pourcent_10;
    if (ratio <= 25) return Pourcentile.pourcent_25;
    if (ratio <= 50) return Pourcentile.pourcent_50;
    return null;
  }

  private mapUserDbToDomain(ub: Utilisateur): Classement {
    return new Classement({
      code_postal: ub.code_postal_classement,
      commune: ub.commune_classement,
      points: ub.points_classement,
      prenom: ub.prenom,
      utilisateurId: ub.id,
      rank: ub.rank,
      rank_commune: ub.rank_commune,
    });
  }
}
