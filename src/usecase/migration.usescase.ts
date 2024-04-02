import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurBehavior } from '../../src/domain/utilisateur/utilisateurBehavior';
import { Feature } from '../../src/domain/gamification/feature';

export type UserMigrationReport = {
  user_id: string;
  migrations: { version: number; ok: boolean; info: string }[];
};

@Injectable()
export class MigrationUsecase {
  constructor(public utilisateurRepository: UtilisateurRepository) {}

  async lockUserMigration(): Promise<any> {
    return this.utilisateurRepository.lockUserMigration();
  }
  async unlockUserMigration(): Promise<any> {
    return this.utilisateurRepository.unlockUserMigration();
  }

  async migrateUsers(): Promise<UserMigrationReport[]> {
    const version_target = UtilisateurBehavior.currentUserSystemVersion();
    const result = [];
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const log = { user_id: user_id, migrations: [] };
      const utilisateur = await this.utilisateurRepository.getById(user_id);
      for (
        let current_version = utilisateur.version + 1;
        current_version <= version_target;
        current_version++
      ) {
        if (!utilisateur.migration_enabled) {
          log.migrations.push({
            version: current_version,
            ok: true,
            info: 'Migrations disabled for that user',
          });
          break;
        }
        const migration_function =
          this['migrate_'.concat(current_version.toString())];
        if (migration_function) {
          const migration_result = await migration_function(utilisateur, this);
          log.migrations.push({
            version: current_version,
            ok: migration_result.ok,
            info: migration_result.info,
          });
          if (!migration_result.ok) {
            break;
          }
          utilisateur.version = current_version;
          await this.utilisateurRepository.updateUtilisateur(utilisateur);
        } else {
          log.migrations.push({
            version: current_version,
            ok: false,
            info: 'Missing migration implementation !',
          });
          break;
        }
      }
      result.push(log);
    }
    return result;
  }

  private async migrate_1(
    utilisateur: Utilisateur,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: true, info: 'dummy migration' };
  }
  private async migrate_2(
    utilisateur: Utilisateur,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_3(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_4(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    const plus_600 = utilisateur.gamification.points > 600;
    if (plus_600) {
      utilisateur.unlocked_features.add(Feature.bibliotheque);
    }
    return {
      ok: true,
      info: `revealed bilbio for user ${utilisateur.id} of ${utilisateur.gamification.points} points : ${plus_600}`,
    };
  }
  private async migrate_5(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    utilisateur.logement.chauffage = utilisateur.onboardingData.chauffage;
    utilisateur.logement.code_postal = utilisateur.onboardingData.code_postal;
    utilisateur.logement.commune = utilisateur.onboardingData.commune;
    utilisateur.logement.nombre_adultes = utilisateur.onboardingData.adultes;
    utilisateur.logement.nombre_enfants = utilisateur.onboardingData.enfants;
    utilisateur.logement.proprietaire = utilisateur.onboardingData.proprietaire;
    utilisateur.logement.superficie = utilisateur.onboardingData.superficie;
    utilisateur.logement.type = utilisateur.onboardingData.residence;
    return {
      ok: true,
      info: `migrated logement data`,
    };
  }
  private async migrate_6(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    utilisateur.transport.avions_par_an = utilisateur.onboardingData.avion;
    utilisateur.transport.transports_quotidiens =
      utilisateur.onboardingData.transports;
    return {
      ok: true,
      info: `migrated transport data`,
    };
  }
  private async migrate_7(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: false, info: 'to implement' };
  }
}
