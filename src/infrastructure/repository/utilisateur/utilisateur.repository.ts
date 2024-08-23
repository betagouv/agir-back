import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../../../domain/utilisateur/utilisateur';
import {
  Impact,
  Onboarding,
  ThematiqueOnboarding,
} from '../../../domain/onboarding/onboarding';
import { OnboardingResult } from '../../../domain/onboarding/onboardingResult';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { Gamification } from '../../../domain/gamification/gamification';
import { History } from '../../../../src/domain/history/history';
import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../domain/object_store/upgrader';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { KYCHistory } from '../../../domain/kyc/kycHistory';
import { Equipements } from '../../../../src/domain/equipements/equipements';
import { Logement } from '../../../domain/logement/logement';
import { Transport } from '../../../domain/transport/transport';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { BibliothequeServices } from '../../../domain/bibliotheque_services/bibliothequeServices';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async getById(id: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async checkEmailExists(email: string): Promise<boolean> {
    const count = await this.prisma.utilisateur.count({
      where: {
        email,
      },
    });
    return count !== 0;
  }
  async findByEmail(email: string): Promise<Utilisateur | null> {
    const users = await this.prisma.utilisateur.findMany({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (users.length !== 1) {
      return null;
    }
    return this.buildUtilisateurFromDB(users[0]);
  }

  async disconnectAll(): Promise<void> {
    await this.prisma.utilisateur.updateMany({
      data: {
        force_connexion: true,
      },
    });
  }
  async checkState(utilisateurId: string) {
    const result = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { force_connexion: true },
    });
    if (result['force_connexion']) {
      ApplicationError.throwPleaseReconnect();
    }
  }

  async updateVersion(utilisateurId: string, version: number): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { version: version },
    });
  }

  async lockUserMigration(): Promise<any> {
    return this.prisma.utilisateur.updateMany({
      data: { migration_enabled: false },
    });
  }
  async unlockUserMigration(): Promise<any> {
    return this.prisma.utilisateur.updateMany({
      data: { migration_enabled: true },
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
  async updateCode(
    utilisateurId: string,
    code: string,
    code_generation_time: Date,
  ): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        code: code,
        code_generation_time: code_generation_time,
      },
    });
  }
  async updateUtilisateur(utilisateur: Utilisateur): Promise<void> {
    try {
      await this.prisma.utilisateur.update({
        where: { id: utilisateur.id, db_version: utilisateur.db_version },
        data: {
          ...this.buildDBFromUtilisateur(utilisateur),
          db_version: { increment: 1 },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        ApplicationError.throwConcurrentUpdate();
      }
      throw error;
    }
  }

  async listUtilisateurIds(): Promise<string[]> {
    const result = await this.prisma.utilisateur.findMany({
      select: {
        id: true,
      },
    });
    return result.map((elem) => elem['id']);
  }

  async createUtilisateur(utilisateur: Utilisateur) {
    try {
      await this.prisma.utilisateur.create({
        data: this.buildDBFromUtilisateur(utilisateur),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          ApplicationError.throwEmailAlreadyExistError(utilisateur.email);
        }
      }
      throw error;
    }
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
    targetThematique: ThematiqueOnboarding,
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
    targetThematiques: ThematiqueOnboarding[],
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

  async update_last_activite(utilisateurId: string) {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        derniere_activite: new Date(),
      },
    });
  }

  async findLastActiveUtilisateurs(
    limit: number,
    offset: number,
    date: Date,
  ): Promise<Utilisateur[]> {
    const utilisateurs = await this.prisma.utilisateur.findMany({
      take: limit | 1,
      skip: offset | 0,
      where: {
        active_account: true,
        updated_at: { gte: date },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
    return utilisateurs.map((elem) => this.buildUtilisateurFromDB(elem));
  }

  async countActiveUsersWithRecentActivity(date: Date): Promise<number> {
    const count = await this.prisma.utilisateur.count({
      where: {
        active_account: true,
        updated_at: { gte: date },
      },
    });
    return Number(count);
  }

  private buildUtilisateurFromDB(user: UtilisateurDB): Utilisateur {
    if (user) {
      const unlocked_features = new UnlockedFeatures(
        Upgrader.upgradeRaw(
          user.unlocked_features,
          SerialisableDomain.UnlockedFeatures,
        ),
      );
      const bibliotheque_services = new BibliothequeServices(
        Upgrader.upgradeRaw(
          user.bilbiotheque_services,
          SerialisableDomain.BibliothequeServices,
        ),
      );
      const parcours_todo = new ParcoursTodo(
        Upgrader.upgradeRaw(user.todo, SerialisableDomain.ParcoursTodo),
      );
      const history = new History(
        Upgrader.upgradeRaw(user.history, SerialisableDomain.History),
      );
      const gamification = new Gamification(
        Upgrader.upgradeRaw(user.gamification, SerialisableDomain.Gamification),
      );
      const onboarding = new Onboarding(
        Upgrader.upgradeRaw(user.onboardingData, SerialisableDomain.Onboarding),
      );
      const onboardingResult = new OnboardingResult(
        Upgrader.upgradeRaw(
          user.onboardingResult,
          SerialisableDomain.OnboardingResult,
        ),
      );
      const kyc = new KYCHistory(
        Upgrader.upgradeRaw(user.kyc, SerialisableDomain.KYCHistory),
      );
      const defis = new DefiHistory(
        Upgrader.upgradeRaw(user.defis, SerialisableDomain.DefiHistory),
      );
      const equipements = new Equipements(
        Upgrader.upgradeRaw(user.equipements, SerialisableDomain.Equipements),
      );
      const logement = new Logement(
        Upgrader.upgradeRaw(user.logement, SerialisableDomain.Logement),
      );
      const transport = new Transport(
        Upgrader.upgradeRaw(user.transport, SerialisableDomain.Transport),
      );
      const missions = new MissionsUtilisateur(
        Upgrader.upgradeRaw(
          user.missions,
          SerialisableDomain.MissionsUtilisateur,
        ),
      );

      return new Utilisateur({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        revenu_fiscal: user.revenu_fiscal,
        parts: user.parts ? user.parts.toNumber() : null,
        abonnement_ter_loire: user.abonnement_ter_loire,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        onboardingData: onboarding,
        onboardingResult: onboardingResult,
        failed_login_count: user.failed_login_count,
        prevent_login_before: user.prevent_login_before,
        code: user.code,
        code_generation_time: user.code_generation_time,
        prevent_checkcode_before: user.prevent_checkcode_before,
        failed_checkcode_count: user.failed_checkcode_count,
        active_account: user.active_account,
        sent_email_count: user.sent_email_count,
        prevent_sendemail_before: user.prevent_sendemail_before,
        created_at: user.created_at,
        updated_at: user.updated_at,
        parcours_todo: parcours_todo,
        gamification: gamification,
        history: history,
        kyc_history: kyc,
        equipements: equipements,
        code_departement: user.code_departement,
        unlocked_features: unlocked_features,
        version: user.version,
        migration_enabled: user.migration_enabled,
        logement: logement,
        transport: transport,
        tag_ponderation_set: user.tag_ponderation_set as any,
        defi_history: defis,
        force_connexion: user.force_connexion,
        derniere_activite: user.derniere_activite,
        missions: missions,
        annee_naissance: user.annee_naissance,
        db_version: user.db_version,
        bilbiotheque_services: bibliotheque_services,
        is_magic_link_user: user.is_magic_link_user,
        code_postal_classement: user.code_postal_classement,
        commune_classement: user.commune_classement,
        points_classement: user.points_classement,
        rank: user.rank,
        rank_commune: user.rank_commune,
        status: UtilisateurStatus[user.status],
        couverture_aides_ok: user.couverture_aides_ok,
        source_inscription: SourceInscription[user.source_inscription],
      });
    }
    return null;
  }

  private buildDBFromUtilisateur(user: Utilisateur): UtilisateurDB {
    return {
      id: user.id ? user.id : uuidv4(),
      nom: user.nom,
      prenom: user.prenom,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      revenu_fiscal: user.revenu_fiscal,
      parts: user.parts ? new Prisma.Decimal(user.parts) : null,
      abonnement_ter_loire: user.abonnement_ter_loire,
      code_departement: user.code_departement,
      email: user.email,
      code: user.code,
      code_generation_time: user.code_generation_time,
      active_account: user.active_account,
      failed_checkcode_count: user.failed_checkcode_count,
      prevent_checkcode_before: user.prevent_checkcode_before,
      sent_email_count: user.sent_email_count,
      prevent_sendemail_before: user.prevent_sendemail_before,
      onboardingData: Upgrader.serialiseToLastVersion(
        user.onboardingData,
        SerialisableDomain.Onboarding,
      ),
      onboardingResult: Upgrader.serialiseToLastVersion(
        user.onboardingResult,
        SerialisableDomain.OnboardingResult,
      ),
      todo: Upgrader.serialiseToLastVersion(
        user.parcours_todo,
        SerialisableDomain.ParcoursTodo,
      ),
      gamification: Upgrader.serialiseToLastVersion(
        user.gamification,
        SerialisableDomain.Gamification,
      ),
      unlocked_features: Upgrader.serialiseToLastVersion(
        user.unlocked_features,
        SerialisableDomain.UnlockedFeatures,
      ),
      history: Upgrader.serialiseToLastVersion(
        user.history,
        SerialisableDomain.History,
      ),
      equipements: Upgrader.serialiseToLastVersion(
        user.equipements,
        SerialisableDomain.Equipements,
      ),
      logement: Upgrader.serialiseToLastVersion(
        user.logement,
        SerialisableDomain.Logement,
      ),
      transport: Upgrader.serialiseToLastVersion(
        user.transport,
        SerialisableDomain.Transport,
      ),
      kyc: Upgrader.serialiseToLastVersion(
        user.kyc_history,
        SerialisableDomain.KYCHistory,
      ),
      missions: Upgrader.serialiseToLastVersion(
        user.missions,
        SerialisableDomain.MissionsUtilisateur,
      ),
      bilbiotheque_services: Upgrader.serialiseToLastVersion(
        user.bilbiotheque_services,
        SerialisableDomain.BibliothequeServices,
      ),
      version: user.version,
      failed_login_count: user.failed_login_count,
      prevent_login_before: user.prevent_login_before,
      migration_enabled: user.migration_enabled,
      tag_ponderation_set: user.tag_ponderation_set,
      defis: Upgrader.serialiseToLastVersion(
        user.defi_history,
        SerialisableDomain.DefiHistory,
      ),
      force_connexion: user.force_connexion,
      derniere_activite: user.derniere_activite,
      annee_naissance: user.annee_naissance,
      created_at: undefined,
      updated_at: undefined,
      db_version: user.db_version,
      is_magic_link_user: user.is_magic_link_user,
      code_postal_classement: user.code_postal_classement,
      commune_classement: user.commune_classement,
      points_classement: user.points_classement,
      rank: user.rank,
      rank_commune: user.rank_commune,
      status: user.status,
      couverture_aides_ok: user.couverture_aides_ok,
      source_inscription: user.source_inscription,
    };
  }
}
