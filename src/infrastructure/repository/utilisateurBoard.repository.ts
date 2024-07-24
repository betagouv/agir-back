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

  /*

  async utilisateur_classement_proximite(
    points: number,
    nombre: number,
    position: 'avant' | 'apres',
    utlisateurId?: string,
  ): Promise<Classement[]> {
    let diff;
    if (position === 'avant') {
      diff = `points - ${points}`;
    } else {
      diff = `${points} - points`;
    }
    let exclude_user = utlisateurId
      ? `AND "utilisateurId" <> '${utlisateurId}'`
      : '';
    let query = `
    SELECT
      *,
      (${diff}) AS difference,
      ABS(${points} - points) AS distance,
    FROM
      "UtilisateurBoard"
    WHERE
      (${diff}) >= 0
      ${exclude_user}
    ORDER BY distance ASC
    LIMIT ${nombre};`;
    let result: {
      utilisateurId: string;
      distance: number;
      points: number;
      difference: number;
      code_postal: string;
      commune: string;
      prenom: string;
      rank: number;
    }[] = await this.prisma.$queryRawUnsafe(query);

    if (position === 'apres') {
      result.sort((a, b) => a.difference - b.difference);
    } else {
      result.sort((a, b) => b.difference - a.difference);
    }

    return result.map(
      (e) =>
        new Classement({
          code_postal: e.code_postal,
          commune: e.commune,
          points: e.points,
          utilisateurId: e.utilisateurId,
          prenom: e.prenom,
          rank: Number(e.rank),
        }),
    );
  }
  */

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
        },
      });
      count_better_than_user = await this.prisma.utilisateur.count({
        where: {
          code_postal_classement: code_postal,
          commune_classement: commune,
          points_classement: {
            gt: points,
          },
        },
      });
    } else {
      count_total = await this.prisma.utilisateur.count();
      count_better_than_user = await this.prisma.utilisateur.count({
        where: {
          points_classement: {
            gt: points,
          },
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
