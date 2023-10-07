import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
import { UserQuizzProfile } from '../../domain/quizz/userQuizzProfile';
import { Profile } from '../../../src/domain/utilisateur/profile';
import {
  Impact,
  OnboardingData,
  Thematique,
} from '../../../src/domain/utilisateur/onboardingData';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async findUtilisateursByName(name: string): Promise<Utilisateur[] | null> {
    let liste = await this.prisma.utilisateur.findMany({
      where: {
        name,
      },
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
      include: {
        badges: true,
      },
    });
    return liste.map((user) => this.buildUtilisateurFromDB(user));
  }
  async findUtilisateurById(id: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
      include: {
        badges: true,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async findUtilisateurByEmail(email: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }

  async updateProfile(utilisateurId: string, profile: Profile) {
    return this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        name: profile.name,
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        code_postal: profile.code_postal,
      },
    });
  }

  async listUtilisateur(): Promise<Utilisateur[] | null> {
    const liste = await this.prisma.utilisateur.findMany({
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
    });
    return liste.map((user) => this.buildUtilisateurFromDB(user));
  }
  async listUtilisateurIds(): Promise<Record<'id', string>[] | null> {
    const result = await this.prisma.utilisateur.findMany({
      select: {
        id: true,
      },
    });
    return result as Record<'id', string>[];
  }

  async createUtilisateur(
    utilisateur: Utilisateur,
  ): Promise<Utilisateur | null> {
    try {
      const user = await this.prisma.utilisateur.create({
        data: {
          id: uuidv4(),
          name: utilisateur.name,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          passwordHash: utilisateur.passwordHash,
          passwordSalt: utilisateur.passwordSalt,
          email: utilisateur.email,
          onboardingData: { ...utilisateur.onboardingData },
          quizzLevels: utilisateur.quizzProfile.getData(),
        },
      });
      return this.buildUtilisateurFromDB(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Adresse [${utilisateur.email}]email deja existante`,
          );
        }
      }
    }
  }

  async addPointsToUtilisateur(utilisateurId: string, points: number) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        points: {
          increment: points,
        },
      },
    });
  }
  async updateQuizzProfile(
    utilisateurId: string,
    quizzProfile: UserQuizzProfile,
  ) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        quizzLevels: quizzProfile.getData(),
      },
    });
  }

  async countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
    minImpact: Impact,
    nombreThematiques: number,
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE ( 0 + `;
    for (
      let impact: number = minImpact;
      impact <= Impact.tres_eleve;
      impact++
    ) {
      query = query.concat(
        `+ JSONB_ARRAY_LENGTH("onboardingResult" -> 'ventilation_par_impacts' -> '${impact}') `,
      );
    }
    query = query.concat(`) >= ${nombreThematiques}`);
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async countUsersWithLessImpactOnThematique(
    maxImpact: Impact,
    targetThematique: Thematique,
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE CAST("onboardingResult" -> 'ventilation_par_thematiques' -> '${targetThematique}' AS INTEGER) < ${maxImpact}`;
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async countUsersWithMoreImpactOnThematiques(
    minImpacts: Impact[],
    targetThematiques: Thematique[],
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE 1=1 `;
    for (let index = 0; index < minImpacts.length; index++) {
      query = query.concat(
        ` AND CAST("onboardingResult" -> 'ventilation_par_thematiques' -> '${targetThematiques[index]}' AS INTEGER) > ${minImpacts[index]} `,
      );
    }
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async nombreTotalUtilisateurs(): Promise<number> {
    const count = await this.prisma.utilisateur.count();
    return Number(count);
  }

  private buildUtilisateurFromDB(user: UtilisateurDB): Utilisateur {
    return user
      ? {
          id: user.id,
          name: user.name,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          code_postal: user.code_postal,
          passwordHash: user.passwordHash,
          passwordSalt: user.passwordSalt,
          onboardingData: new OnboardingData(user.onboardingData as any),
          points: user.points,
          quizzProfile: new UserQuizzProfile(user.quizzLevels as any),
          created_at: user.created_at,
          badges: user['badges'],
        }
      : null;
  }
}
