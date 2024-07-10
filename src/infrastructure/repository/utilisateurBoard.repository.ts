import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Classement } from '../../domain/gamification/classement';
import { UtilisateurBoard } from '@prisma/client';
import { Pourcetile } from '../api/types/gamification/boardAPI';

@Injectable()
export class UtilisateurBoardRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(classement: Classement): Promise<void> {
    await this.prisma.utilisateurBoard.upsert({
      where: { utilisateurId: classement.utilisateurId },
      create: {
        points: classement.points,
        code_postal: classement.code_postal,
        commune: classement.commune,
        prenom: classement.prenom,
        utilisateurId: classement.utilisateurId,
        created_at: undefined,
        updated_at: undefined,
      },
      update: {
        points: classement.points,
        code_postal: classement.code_postal,
        commune: classement.commune,
        prenom: classement.prenom,
        updated_at: undefined,
      },
    });
  }

  async top_trois(): Promise<Classement[]> {
    const top = await this.prisma.utilisateurBoard.findMany({
      take: 3,
      orderBy: { points: 'desc' },
    });
    return top.map((t) => this.mapDbToDomain(t));
  }

  async top_trois_commune(
    code_postal: string,
    commune: string,
  ): Promise<Classement[]> {
    const top = await this.prisma.utilisateurBoard.findMany({
      take: 3,
      where: {
        code_postal: code_postal,
        commune: commune,
      },
      orderBy: { points: 'desc' },
    });
    return top.map((t) => this.mapDbToDomain(t));
  }

  async classement_utilisateur(utilisateurId: string): Promise<Classement> {
    const result = await this.prisma.utilisateurBoard.findUnique({
      where: {
        utilisateurId: utilisateurId,
      },
    });
    if (result) {
      return this.mapDbToDomain(result);
    }
    return null;
  }

  async update_rank_france() {
    const query = `
    WITH tmp as (
      SELECT
        "utilisateurId",  
        DENSE_RANK() OVER ( ORDER BY points DESC) AS rnk
      FROM
        "UtilisateurBoard"
    )
    UPDATE
      "UtilisateurBoard"
    SET
      rank = tmp.rnk
    FROM
      tmp
    WHERE
    "UtilisateurBoard"."utilisateurId" = tmp."utilisateurId";`;
    await this.prisma.$queryRawUnsafe(query);
  }

  async update_rank_commune() {
    const query = `
    WITH tmp as (
      SELECT
        "utilisateurId",  
        DENSE_RANK() OVER ( PARTITION BY "code_postal", "commune" ORDER BY points DESC) AS rnk
      FROM
        "UtilisateurBoard"
    )
    UPDATE
      "UtilisateurBoard"
    SET
      rank_commune = tmp.rnk
    FROM
      tmp
    WHERE
    "UtilisateurBoard"."utilisateurId" = tmp."utilisateurId";`;
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
          rank: 'asc',
        },
      };
    } else {
      orderBy = {
        orderBy: {
          rank_commune: 'asc',
        },
      };
    }

    let filtre_commune = {};
    if (scope === 'local') {
      filtre_commune = {
        code_postal: code_postal,
        commune: commune,
      };
    }

    const result = await this.prisma.utilisateurBoard.findMany({
      take: nombre,
      ...orderBy,
      where: {
        ...rank_cond,
        utilisateurId: user_cond,
        ...filtre_commune,
      },
    });

    return result.map((t) => this.mapDbToDomain(t));
  }
  async getPourcentile(
    points: number,
    code_postal?: string,
    commune?: string,
  ): Promise<Pourcetile> {
    let count_total;
    let count_better_than_user;
    if (code_postal) {
      count_total = await this.prisma.utilisateurBoard.count({
        where: {
          code_postal: code_postal,
          commune: commune,
        },
      });
      count_better_than_user = await this.prisma.utilisateurBoard.count({
        where: {
          code_postal: code_postal,
          commune: commune,
          points: {
            gt: points,
          },
        },
      });
    } else {
      count_total = await this.prisma.utilisateurBoard.count();
      count_better_than_user = await this.prisma.utilisateurBoard.count({
        where: {
          points: {
            gt: points,
          },
        },
      });
    }
    const ratio = Math.round((count_better_than_user / count_total) * 100);
    if (ratio <= 5) return Pourcetile.pourcent_5;
    if (ratio <= 10) return Pourcetile.pourcent_10;
    if (ratio <= 25) return Pourcetile.pourcent_25;
    if (ratio <= 50) return Pourcetile.pourcent_50;
    return null;
  }

  private mapDbToDomain(ub: UtilisateurBoard): Classement {
    return new Classement({
      code_postal: ub.code_postal,
      commune: ub.commune,
      points: ub.points,
      prenom: ub.prenom,
      utilisateurId: ub.utilisateurId,
      rank: ub.rank,
      rank_commune: ub.rank_commune,
    });
  }
}
