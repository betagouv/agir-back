import { Injectable } from '@nestjs/common';
import { Prisma, Utilisateur as UtilisateurDB } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { History } from '../../../../src/domain/history/history';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { BibliothequeServices } from '../../../domain/bibliotheque_services/bibliothequeServices';
import { CacheBilanCarbone } from '../../../domain/bilan/cacheBilanCarbone';
import { Gamification } from '../../../domain/gamification/gamification';
import { KYCHistory } from '../../../domain/kyc/kycHistory';
import { Logement } from '../../../domain/logement/logement';
import { NotificationHistory } from '../../../domain/notification/notificationHistory';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../domain/object_store/upgrader';
import { ProfileRecommandationUtilisateur } from '../../../domain/scoring/system_v2/profileRecommandationUtilisateur';
import { ThematiqueHistory } from '../../../domain/thematique/history/thematiqueHistory';
import {
  GlobalUserVersion,
  ModeInscription,
  Scope,
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../../../domain/utilisateur/utilisateur';
import { PrismaService } from '../../prisma/prisma.service';
import { KycRepository } from '../kyc.repository';

export type UserFilter = {
  created_after?: Date;
  is_active?: boolean;
  max_number?: number;
  code_postal?: string;
  migration_enabled?: boolean;
  max_version_excluded?: number;
  has_mobile_push_notif_token?: boolean;
};
const OMIT_ALL_CONFIGURATION_JSON = {
  gamification: true,
  history: true,
  kyc: true,
  logement: true,
  bilbiotheque_services: true,
  thematique_history: true,
};

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async listePseudosAValider(): Promise<{ id: string; pseudo: string }[]> {
    return await this.prisma.utilisateur.findMany({
      where: {
        est_valide_pour_classement: false,
        active_account: true,
        NOT: {
          OR: [{ pseudo: '' }, { pseudo: null }],
        },
      },
      select: {
        id: true,
        pseudo: true,
      },
    });
  }

  async validerPseudo(utilisateurId: string, pseudo: string) {
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        pseudo: pseudo,
        est_valide_pour_classement: true,
      },
    });
  }

  async getById(id: string, scopes: Scope[]): Promise<Utilisateur | null> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    const user = await this.prisma.utilisateur.findUnique({
      omit: this.buildOmitBlockFromScopes(scopes),
      where: {
        id,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async getByEmailToken(token: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      omit: OMIT_ALL_CONFIGURATION_JSON,
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

  async isPseudoValide(pseudo: string): Promise<boolean> {
    const count = await this.prisma.utilisateur.count({
      where: {
        pseudo: pseudo,
        est_valide_pour_classement: true,
      },
    });
    return count > 0;
  }

  async findByEmail(
    email: string,
    version: 'full' | 'light' = 'light',
  ): Promise<Utilisateur | null> {
    let omit = {};
    if (version === 'light') {
      omit = OMIT_ALL_CONFIGURATION_JSON;
    }
    const users = await this.prisma.utilisateur.findMany({
      omit: omit,
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    if (users.length === 0) {
      return null;
    }
    return this.buildUtilisateurFromDB(users[0]);
  }
  async getByFranceConnectSub(
    sub: string,
    version: 'full' | 'light' = 'light',
  ): Promise<Utilisateur | null> {
    let omit = {};
    if (version === 'light') {
      omit = OMIT_ALL_CONFIGURATION_JSON;
    }
    const user = await this.prisma.utilisateur.findUnique({
      omit: omit,
      where: {
        france_connect_sub: sub,
      },
    });

    return user ? this.buildUtilisateurFromDB(user) : null;
  }

  async setFranceConnectSub(utilisateurId: string, sub: string) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        france_connect_sub: sub,
      },
    });
  }
  async setMobileToken(utilisateurId: string, token: string) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        mobile_token: token,
        mobile_token_updated_at: new Date(),
      },
    });
  }

  async does_email_exist(email: string): Promise<boolean> {
    const count = await this.prisma.utilisateur.count({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    return count > 0;
  }

  async countByCodesCommune(liste_codes_commune: string[]): Promise<number> {
    const query = `
    SELECT
      count(*)
    FROM
      "Utilisateur"
    WHERE
      logement ->> 'code_commune' IN (${liste_codes_commune
        .map((c) => "'" + c + "'")
        .join(',')});`;
    const result = await this.prisma.$queryRawUnsafe(query);
    return parseInt((result as any)[0].count);
  }

  async findUserIdsByCodesCommune(
    liste_codes_commune: string[],
  ): Promise<string[]> {
    const query = `
    SELECT
      id
    FROM
      "Utilisateur"
    WHERE
      logement ->> 'code_commune' IN (${liste_codes_commune
        .map((c) => "'" + c + "'")
        .join(',')});`;
    const result = await this.prisma.$queryRawUnsafe(query);
    return (result as any).map((u) => u.id);
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
      omit: this.buildOmitBlockFromScopes(scopes),
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
  async updateUtilisateurExternalStatId(
    utilisateurId: string,
    external_stat_id: string,
  ): Promise<void> {
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        external_stat_id: external_stat_id,
      },
    });
  }

  async listePaginatedUsers(
    skip: number,
    take: number,
    scopes: Scope[],
    filter: UserFilter,
  ): Promise<Utilisateur[]> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    const where = this.buildWhereQuertPart(filter);

    const results = await this.prisma.utilisateur.findMany({
      skip: skip,
      take: take,
      omit: this.buildOmitBlockFromScopes(scopes),
      orderBy: {
        id: 'desc',
      },
      where: where,
    });
    return results.map((r) => this.buildUtilisateurFromDB(r));
  }

  async listUtilisateurIds(filter: UserFilter): Promise<string[]> {
    const where = this.buildWhereQuertPart(filter);
    let query = {
      select: {
        id: true,
      },
      where: where,
    };
    const result = await this.prisma.utilisateur.findMany(query);

    return result.map((elem) => elem['id']);
  }

  private buildWhereQuertPart(filter: UserFilter): any {
    const result = {} as any;
    if (filter.created_after) {
      result.created_at = {
        gte: filter.created_after,
      };
    }
    if (filter.is_active) {
      result.active_account = true;
    }
    if (filter.migration_enabled) {
      result.migration_enabled = true;
    }
    if (filter.max_version_excluded) {
      result.version = { lt: filter.max_version_excluded };
    }
    if (filter.max_number) {
      result['take'] = filter.max_number;
    }
    if (filter.code_postal) {
      result.logement = {
        path: ['code_postal'],
        equals: filter.code_postal,
      };
    }
    if (filter.has_mobile_push_notif_token) {
      result.mobile_token = {
        not: null,
      };
    }
    return result;
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
      where: {
        brevo_created_at: null,
      },
    });
    return result.map((elem) => elem['id']);
  }

  async listUtilisateurToUpdateInBrevo(
    skip: number,
    take: number,
    scopes: Scope[],
  ): Promise<Utilisateur[]> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    const result = await this.prisma.utilisateur.findMany({
      skip: skip,
      take: take,
      omit: this.buildOmitBlockFromScopes(scopes),
      orderBy: {
        id: 'asc',
      },
      where: {
        brevo_update_disabled: false,
        brevo_created_at: {
          not: null,
        },
        OR: [
          {
            brevo_updated_at: null,
          },
          {
            brevo_updated_at: {
              lt: this.prisma.utilisateur.fields.derniere_activite,
            },
          },
        ],
      },
    });
    return result.map((r) => this.buildUtilisateurFromDB(r));
  }
  async countUtilisateurToUpdateInBrevo(): Promise<number> {
    return await this.prisma.utilisateur.count({
      where: {
        OR: [
          {
            brevo_updated_at: null,
          },
          {
            brevo_updated_at: {
              lt: this.prisma.utilisateur.fields.derniere_activite,
            },
          },
        ],
      },
    });
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

  async update_last_activite(utilisateurId: string, log: Date[]) {
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        derniere_activite: new Date(),
        activity_dates_log: log,
      },
    });
  }
  async getActivityLog(utilisateurId: string): Promise<Date[]> {
    const result = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        activity_dates_log: true,
      },
    });

    return result.activity_dates_log;
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

  async countAll(): Promise<number> {
    const count = await this.prisma.utilisateur.count();
    return Number(count);
  }

  private buildUtilisateurFromDB(user: Partial<UtilisateurDB>): Utilisateur {
    if (!user) {
      return null;
    }
    const bibliotheque_services = user.bilbiotheque_services
      ? new BibliothequeServices(
          Upgrader.upgradeRaw(
            user.bilbiotheque_services,
            SerialisableDomain.BibliothequeServices,
          ),
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
    const logement = user.logement
      ? new Logement(
          Upgrader.upgradeRaw(user.logement, SerialisableDomain.Logement),
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

    const thematique_history = user.thematique_history
      ? new ThematiqueHistory(
          Upgrader.upgradeRaw(
            user.thematique_history,
            SerialisableDomain.ThematiqueHistory,
          ),
        )
      : undefined;

    const cache_bilan_carbone = user.cache_bilan_carbone
      ? new CacheBilanCarbone(
          Upgrader.upgradeRaw(
            user.cache_bilan_carbone,
            SerialisableDomain.CacheBilanCarbone,
          ),
        )
      : undefined;

    const recommandation = user.recommandation
      ? new ProfileRecommandationUtilisateur(
          Upgrader.upgradeRaw(
            user.recommandation,
            SerialisableDomain.ProfileRecommandationUtilisateur,
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
      gamification: gamification,
      history: history,
      kyc_history: kyc,
      version: user.version,
      migration_enabled: user.migration_enabled,
      logement: logement,
      tag_ponderation_set: user.tag_ponderation_set as any,
      force_connexion: user.force_connexion,
      derniere_activite: user.derniere_activite,
      annee_naissance: user.annee_naissance,
      mois_naissance: user.mois_naissance,
      jour_naissance: user.jour_naissance,
      db_version: user.db_version,
      bilbiotheque_services: bibliotheque_services,
      points_classement: user.points_classement,
      rank: user.rank,
      rank_commune: user.rank_commune,
      status: UtilisateurStatus[user.status],
      couverture_aides_ok: user.couverture_aides_ok,
      source_inscription:
        SourceInscription[user.source_inscription] ||
        SourceInscription.inconnue,
      mode_inscription:
        ModeInscription[user.mode_inscription] || ModeInscription.inconnue,
      notification_history: notification_history,
      thematique_history: thematique_history,
      unsubscribe_mail_token: user.unsubscribe_mail_token,
      est_valide_pour_classement: user.est_valide_pour_classement,
      brevo_created_at: user.brevo_created_at,
      brevo_updated_at: user.brevo_updated_at,
      brevo_update_disabled: user.brevo_update_disabled,
      mobile_token: user.mobile_token,
      mobile_token_updated_at: user.mobile_token_updated_at,
      france_connect_sub: user.france_connect_sub,
      external_stat_id: user.external_stat_id,
      pseudo: user.pseudo,
      cache_bilan_carbone: cache_bilan_carbone,
      global_user_version: GlobalUserVersion[user.global_user_version],
      recommandation: recommandation,
      code_commune_classement: user.code_commune_classement,
      is_magic_link: user.is_magic_link_user,
    });

    if (result.kyc_history) {
      result.kyc_history.setCatalogue(KycRepository.getCatalogue());
    }
    return result;
  }

  private buildNewDBUserFromUtilisateur(user: Utilisateur): UtilisateurDB {
    return {
      ...this.buildDBUserCoreDataFromUtilisateur(user),
      ...this.buildDBVersionnedDataFromUtilisateur(user, [Scope.ALL]),
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
      mois_naissance: user.mois_naissance,
      jour_naissance: user.jour_naissance,
      db_version: user.db_version,
      points_classement: user.points_classement,
      rank: user.rank,
      rank_commune: user.rank_commune,
      status: user.status,
      couverture_aides_ok: user.couverture_aides_ok,
      source_inscription: user.source_inscription,
      mode_inscription: user.mode_inscription,
      unsubscribe_mail_token: user.unsubscribe_mail_token,
      est_valide_pour_classement: user.est_valide_pour_classement,
      brevo_created_at: user.brevo_created_at,
      brevo_updated_at: user.brevo_updated_at,
      brevo_update_disabled: user.brevo_update_disabled,
      mobile_token: user.mobile_token,
      mobile_token_updated_at: user.mobile_token_updated_at,
      created_at: undefined,
      updated_at: undefined,
      gamification: undefined,
      history: undefined,
      logement: undefined,
      kyc: undefined,
      bilbiotheque_services: undefined,
      notification_history: undefined,
      thematique_history: undefined,
      cache_bilan_carbone: undefined,
      recommandation: undefined,
      france_connect_sub: user.france_connect_sub,
      external_stat_id: user.external_stat_id,
      pseudo: user.pseudo,
      global_user_version: user.global_user_version,
      activity_dates_log: undefined,
      code_commune_classement: user.code_commune_classement,
      is_magic_link_user: undefined,
    };
  }

  private buildDBVersionnedDataFromUtilisateur(
    user: Utilisateur,
    scopes: Scope[],
  ): Partial<UtilisateurDB> {
    if (scopes.includes(Scope.ALL)) {
      scopes = Object.values(Scope);
    }
    return {
      cache_bilan_carbone: scopes.includes(Scope.cache_bilan_carbone)
        ? Upgrader.serialiseToLastVersion(
            user.cache_bilan_carbone,
            SerialisableDomain.CacheBilanCarbone,
          )
        : undefined,
      gamification: scopes.includes(Scope.gamification)
        ? Upgrader.serialiseToLastVersion(
            user.gamification,
            SerialisableDomain.Gamification,
          )
        : undefined,
      history: scopes.includes(Scope.history_article_quizz_aides)
        ? Upgrader.serialiseToLastVersion(
            user.history,
            SerialisableDomain.History,
          )
        : undefined,
      logement: scopes.includes(Scope.logement)
        ? Upgrader.serialiseToLastVersion(
            user.logement,
            SerialisableDomain.Logement,
          )
        : undefined,
      kyc: scopes.includes(Scope.kyc)
        ? Upgrader.serialiseToLastVersion(
            user.kyc_history,
            SerialisableDomain.KYCHistory,
          )
        : undefined,
      bilbiotheque_services: scopes.includes(Scope.bilbiotheque_services)
        ? Upgrader.serialiseToLastVersion(
            user.bilbiotheque_services,
            SerialisableDomain.BibliothequeServices,
          )
        : undefined,
      notification_history: scopes.includes(Scope.notification_history)
        ? Upgrader.serialiseToLastVersion(
            user.notification_history,
            SerialisableDomain.NotificationHistory,
          )
        : undefined,
      thematique_history: scopes.includes(Scope.thematique_history)
        ? Upgrader.serialiseToLastVersion(
            user.thematique_history,
            SerialisableDomain.ThematiqueHistory,
          )
        : undefined,
      recommandation: scopes.includes(Scope.recommandation)
        ? Upgrader.serialiseToLastVersion(
            user.recommandation,
            SerialisableDomain.ProfileRecommandationUtilisateur,
          )
        : undefined,
    };
  }

  private buildDBFromUtilisateurForUpdate(
    user: Utilisateur,
    scopes?: Scope[],
  ): Partial<UtilisateurDB> {
    const versionned_data = this.buildDBVersionnedDataFromUtilisateur(
      user,
      scopes ? scopes : [Scope.ALL],
    );

    if (!scopes || scopes.includes(Scope.core) || scopes.includes(Scope.ALL)) {
      return {
        ...this.buildDBUserCoreDataFromUtilisateur(user),
        ...versionned_data,
      };
    } else {
      return {
        id: user.id,
        ...versionned_data,
      };
    }
  }

  private buildOmitBlockFromScopes(scopes: Scope[]): any {
    return {
      gamification: !scopes.includes(Scope.gamification),
      history: !scopes.includes(Scope.history_article_quizz_aides),
      kyc: !scopes.includes(Scope.kyc),
      logement: !scopes.includes(Scope.logement),
      bilbiotheque_services: !scopes.includes(Scope.bilbiotheque_services),
      notification_history: !scopes.includes(Scope.notification_history),
      thematique_history: !scopes.includes(Scope.thematique_history),
      cache_bilan_carbone: !scopes.includes(Scope.cache_bilan_carbone),
      activity_dates_log: true,
    };
  }
}
