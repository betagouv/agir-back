import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import {
  Scope,
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../../../domain/utilisateur/utilisateur';
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
import { Logement } from '../../../domain/logement/logement';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { BibliothequeServices } from '../../../domain/bibliotheque_services/bibliothequeServices';
import { NotificationHistory } from '../../../domain/notification/notificationHistory';
import { KycRepository } from '../kyc.repository';
import { MissionRepository } from '../mission.repository';
import { DefiRepository } from '../defi.repository';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async listePrenomsAValider(): Promise<{ id: string; prenom: string }[]> {
    return await this.prisma.utilisateur.findMany({
      where: {
        est_valide_pour_classement: false,
        active_account: true,
        NOT: {
          OR: [{ prenom: '' }, { prenom: null }],
        },
      },
      select: {
        id: true,
        prenom: true,
      },
    });
  }

  async validerPrenom(utilisateurId: string, prenom: string) {
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        prenom: prenom,
        est_valide_pour_classement: true,
      },
    });
  }

  async getById(id: string, scopes: Scope[]): Promise<Utilisateur | null> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    const user = await this.prisma.utilisateur.findUnique({
      omit: {
        todo: !scopes.includes(Scope.todo),
        gamification: !scopes.includes(Scope.gamification),
        history: !scopes.includes(Scope.history_article_quizz_aides),
        kyc: !scopes.includes(Scope.kyc),
        unlocked_features: !scopes.includes(Scope.unlocked_features),
        logement: !scopes.includes(Scope.logement),
        defis: !scopes.includes(Scope.defis),
        missions: !scopes.includes(Scope.missions),
        bilbiotheque_services: !scopes.includes(Scope.bilbiotheque_services),
        notification_history: !scopes.includes(Scope.notification_history),
      },
      where: {
        id,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async getByEmailToken(token: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      omit: {
        todo: true,
        gamification: true,
        history: true,
        kyc: true,
        unlocked_features: true,
        logement: true,
        defis: true,
        missions: true,
        bilbiotheque_services: true,
      },
      where: {
        unsubscribe_mail_token: token,
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

  async isPrenomValide(prenom: string): Promise<boolean> {
    const count = await this.prisma.utilisateur.count({
      where: {
        prenom: prenom,
        est_valide_pour_classement: true,
      },
    });
    return count > 0;
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
  async getUserByMobileToken(
    token: string,
    scopes: Scope[],
  ): Promise<Utilisateur | null> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    const user = await this.prisma.utilisateur.findUnique({
      omit: {
        todo: !scopes.includes(Scope.todo),
        gamification: !scopes.includes(Scope.gamification),
        history: !scopes.includes(Scope.history_article_quizz_aides),
        kyc: !scopes.includes(Scope.kyc),
        unlocked_features: !scopes.includes(Scope.unlocked_features),
        logement: !scopes.includes(Scope.logement),
        defis: !scopes.includes(Scope.defis),
        missions: !scopes.includes(Scope.missions),
        bilbiotheque_services: !scopes.includes(Scope.bilbiotheque_services),
        notification_history: !scopes.includes(Scope.notification_history),
      },
      where: {
        mobile_token: token,
      },
    });
    return this.buildUtilisateurFromDB(user);
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
          ...this.buildDBFromUtilisateurForUpdate(utilisateur),
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
  async updateUtilisateurNoConcurency(
    utilisateur: Utilisateur,
    scopes?: Scope[],
  ): Promise<void> {
    await this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        ...this.buildDBFromUtilisateurForUpdate(utilisateur, scopes),
      },
    });
  }

  async listUtilisateurIds(
    created_after?: Date,
    is_active?: boolean,
    max_number?: number,
    code_postal?: string,
  ): Promise<string[]> {
    let query = {
      select: {
        id: true,
      },
      where: {} as any,
    };
    if (created_after) {
      query['where'].created_at = {
        gte: created_after,
      };
    }
    if (is_active) {
      query['where'].active_account = true;
    }
    if (max_number) {
      query['take'] = max_number;
    }
    if (code_postal) {
      query['where'].logement = {
        path: ['code_postal'],
        equals: code_postal,
      };
    }
    const result = await this.prisma.utilisateur.findMany(query);

    return result.map((elem) => elem['id']);
  }

  async listUtilisateurIdsToCreateInBrevo(max?: number): Promise<string[]> {
    const result = await this.prisma.utilisateur.findMany({
      take: max ? max : undefined,
      select: {
        id: true,
      },
      orderBy: {
        id: 'asc',
      },
      where: { brevo_created_at: null },
    });
    return result.map((elem) => elem['id']);
  }

  async createUtilisateur(utilisateur: Utilisateur) {
    try {
      await this.prisma.utilisateur.create({
        data: this.buildNewDBUserFromUtilisateur(utilisateur),
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

  async nombreTotalUtilisateurs(): Promise<number> {
    const count = await this.prisma.utilisateur.count();
    return Number(count);
  }

  async update_last_activite(utilisateurId: string) {
    await this.prisma.utilisateur.update({
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

  private buildUtilisateurFromDB(user: Partial<UtilisateurDB>): Utilisateur {
    if (!user) {
      return null;
    }
    const unlocked_features = user.unlocked_features
      ? new UnlockedFeatures(
          Upgrader.upgradeRaw(
            user.unlocked_features,
            SerialisableDomain.UnlockedFeatures,
          ),
        )
      : undefined;
    const bibliotheque_services = user.bilbiotheque_services
      ? new BibliothequeServices(
          Upgrader.upgradeRaw(
            user.bilbiotheque_services,
            SerialisableDomain.BibliothequeServices,
          ),
        )
      : undefined;
    const parcours_todo = user.todo
      ? new ParcoursTodo(
          Upgrader.upgradeRaw(user.todo, SerialisableDomain.ParcoursTodo),
        )
      : undefined;
    const history = user.history
      ? new History(
          Upgrader.upgradeRaw(user.history, SerialisableDomain.History),
        )
      : undefined;
    const gamification = user.gamification
      ? new Gamification(
          Upgrader.upgradeRaw(
            user.gamification,
            SerialisableDomain.Gamification,
          ),
        )
      : undefined;
    const kyc = user.kyc
      ? new KYCHistory(
          Upgrader.upgradeRaw(user.kyc, SerialisableDomain.KYCHistory),
        )
      : undefined;
    const defis = user.defis
      ? new DefiHistory(
          Upgrader.upgradeRaw(user.defis, SerialisableDomain.DefiHistory),
        )
      : undefined;
    const logement = user.logement
      ? new Logement(
          Upgrader.upgradeRaw(user.logement, SerialisableDomain.Logement),
        )
      : undefined;
    const missions = user.missions
      ? new MissionsUtilisateur(
          Upgrader.upgradeRaw(
            user.missions,
            SerialisableDomain.MissionsUtilisateur,
          ),
        )
      : undefined;
    const notification_history = user.notification_history
      ? new NotificationHistory(
          Upgrader.upgradeRaw(
            user.notification_history,
            SerialisableDomain.NotificationHistory,
          ),
        )
      : undefined;

    const result = new Utilisateur({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      revenu_fiscal: user.revenu_fiscal,
      parts: user.parts ? user.parts.toNumber() : null,
      abonnement_ter_loire: user.abonnement_ter_loire,
      situation_handicap: user.situation_handicap,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
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
      unlocked_features: unlocked_features,
      version: user.version,
      migration_enabled: user.migration_enabled,
      logement: logement,
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
      notification_history: notification_history,
      unsubscribe_mail_token: user.unsubscribe_mail_token,
      est_valide_pour_classement: user.est_valide_pour_classement,
      brevo_created_at: user.brevo_created_at,
      brevo_updated_at: user.brevo_updated_at,
      mobile_token: user.mobile_token,
      mobile_token_updated_at: user.mobile_token_updated_at,
    });

    if (result.kyc_history) {
      result.kyc_history.setCatalogue(KycRepository.getCatalogue());
    }
    if (result.missions) {
      result.missions.setCatalogue(MissionRepository.getCatalogue());
    }
    if (result.defi_history) {
      result.defi_history.setCatalogue(DefiRepository.getCatalogue());
    }
    return result;
  }

  private buildNewDBUserFromUtilisateur(user: Utilisateur): UtilisateurDB {
    return {
      ...this.buildDBUserCoreDataFromUtilisateur(user),
      ...this.buildDBVersionnedDataFromUtilisateur(user),
    };
  }

  private buildDBUserCoreDataFromUtilisateur(user: Utilisateur): UtilisateurDB {
    return {
      id: user.id ? user.id : uuidv4(),
      nom: user.nom,
      prenom: user.prenom,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      revenu_fiscal: user.revenu_fiscal,
      parts: user.parts ? new Prisma.Decimal(user.parts) : null,
      abonnement_ter_loire: user.abonnement_ter_loire,
      situation_handicap: user.situation_handicap,
      email: user.email,
      code: user.code,
      code_generation_time: user.code_generation_time,
      active_account: user.active_account,
      failed_checkcode_count: user.failed_checkcode_count,
      prevent_checkcode_before: user.prevent_checkcode_before,
      sent_email_count: user.sent_email_count,
      prevent_sendemail_before: user.prevent_sendemail_before,
      version: user.version,
      failed_login_count: user.failed_login_count,
      prevent_login_before: user.prevent_login_before,
      migration_enabled: user.migration_enabled,
      tag_ponderation_set: user.tag_ponderation_set,
      force_connexion: user.force_connexion,
      derniere_activite: user.derniere_activite,
      annee_naissance: user.annee_naissance,
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
      unsubscribe_mail_token: user.unsubscribe_mail_token,
      est_valide_pour_classement: user.est_valide_pour_classement,
      brevo_created_at: user.brevo_created_at,
      brevo_updated_at: user.brevo_updated_at,
      mobile_token: user.mobile_token,
      mobile_token_updated_at: user.mobile_token_updated_at,
      created_at: undefined,
      updated_at: undefined,
      todo: undefined,
      gamification: undefined,
      unlocked_features: undefined,
      history: undefined,
      logement: undefined,
      kyc: undefined,
      missions: undefined,
      bilbiotheque_services: undefined,
      notification_history: undefined,
      defis: undefined,
    };
  }

  private buildDBVersionnedDataFromUtilisateur(
    user: Utilisateur,
  ): Partial<UtilisateurDB> {
    return {
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
      logement: Upgrader.serialiseToLastVersion(
        user.logement,
        SerialisableDomain.Logement,
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
      notification_history: Upgrader.serialiseToLastVersion(
        user.notification_history,
        SerialisableDomain.NotificationHistory,
      ),
      defis: Upgrader.serialiseToLastVersion(
        user.defi_history,
        SerialisableDomain.DefiHistory,
      ),
    };
  }

  private buildDBFromUtilisateurForUpdate(
    user: Utilisateur,
    scopes?: Scope[],
  ): Partial<UtilisateurDB> {
    const versionned_data = this.buildDBVersionnedDataFromUtilisateur(user);

    if (scopes && !scopes.includes(Scope.ALL)) {
      if (!scopes.includes(Scope.bilbiotheque_services)) {
        versionned_data.bilbiotheque_services = undefined;
      }
      if (!scopes.includes(Scope.defis)) {
        versionned_data.defis = undefined;
      }
      if (!scopes.includes(Scope.gamification)) {
        versionned_data.gamification = undefined;
      }
      if (!scopes.includes(Scope.history_article_quizz_aides)) {
        versionned_data.history = undefined;
      }
      if (!scopes.includes(Scope.kyc)) {
        versionned_data.kyc = undefined;
      }
      if (!scopes.includes(Scope.logement)) {
        versionned_data.logement = undefined;
      }
      if (!scopes.includes(Scope.missions)) {
        versionned_data.missions = undefined;
      }
      if (!scopes.includes(Scope.notification_history)) {
        versionned_data.notification_history = undefined;
      }
      if (!scopes.includes(Scope.todo)) {
        versionned_data.todo = undefined;
      }
      if (!scopes.includes(Scope.unlocked_features)) {
        versionned_data.unlocked_features = undefined;
      }
      if (!scopes.includes(Scope.core)) {
        return {
          id: user.id,
          ...versionned_data,
        };
      }
    }
    return {
      ...this.buildDBUserCoreDataFromUtilisateur(user),
      ...versionned_data,
    };
  }
}
