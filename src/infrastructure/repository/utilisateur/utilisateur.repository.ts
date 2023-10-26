import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import { Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { UserQuizzProfile } from '../../../domain/quizz/userQuizzProfile';
import { Profile } from '../../../domain/utilisateur/profile';
import {
  Impact,
  OnboardingData,
  Thematique,
} from '../../../domain/utilisateur/onboardingData';
import { OnboardingResult } from '../../../domain/utilisateur/onboardingResult';
import { CodeAwareUtilisateur } from '../../../domain/utilisateur/manager/codeAwareUtilisateur';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async findUtilisateursByNom(nom: string): Promise<Utilisateur[] | null> {
    let liste = await this.prisma.utilisateur.findMany({
      where: {
        nom: nom,
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
      include: {
        badges: true,
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
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        code_postal: profile.code_postal,
        passwordHash: profile.passwordHash,
        passwordSalt: profile.passwordSalt,
      },
    });
  }

  async activateAccount(utilisateurId: string): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        active_account: true,
      },
    });
  }
  async updateCode(utilisateurId: string, code: string): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        code: code,
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
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          passwordHash: utilisateur.passwordHash,
          passwordSalt: utilisateur.passwordSalt,
          email: utilisateur.email,
          code: utilisateur.code,
          active_account: utilisateur.active_account,
          failed_checkcode_count: utilisateur.failed_checkcode_count,
          prevent_checkcode_before: utilisateur.prevent_checkcode_before,
          sent_code_count: utilisateur.sent_code_count,
          prevent_sendcode_before: utilisateur.prevent_sendcode_before,
          onboardingData: { ...utilisateur.onboardingData },
          onboardingResult: { ...utilisateur.onboardingResult },
          quizzLevels: utilisateur.quizzProfile.getData(),
        },
      });
      return this.buildUtilisateurFromDB(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Adresse électronique ${utilisateur.email} déjà existante`,
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
    if (user) {
      const onboardingData = new OnboardingData(user.onboardingData as any);
      const onboardingResult = new OnboardingResult(onboardingData);
      return new Utilisateur({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        code_postal: user.code_postal,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        onboardingData: onboardingData,
        onboardingResult: onboardingResult,
        points: user.points,
        failed_login_count: user.failed_login_count,
        prevent_login_before: user.prevent_login_before,
        code: user.code,
        prevent_checkcode_before: user.prevent_checkcode_before,
        failed_checkcode_count: user.failed_checkcode_count,
        active_account: user.active_account,
        sent_code_count: user.sent_code_count,
        prevent_sendcode_before: user.prevent_sendcode_before,
        quizzProfile: new UserQuizzProfile(user.quizzLevels as any),
        created_at: user.created_at,
        badges: user['badges'],
      });
    }
    return null;
  }
}
