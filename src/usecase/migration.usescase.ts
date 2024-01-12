import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurBehavior } from '../../src/domain/utilisateur/utilisateurBehavior';
import { InteractionType } from '../../src/domain/interaction/interactionType';

export type UserMigrationReport = {
  user_id: string;
  migrations: { version: number; ok: boolean; info: string }[];
};

@Injectable()
export class MigrationUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public interactionRepository: InteractionRepository,
  ) {}

  async lockUserMigration(): Promise<any> {
    return this.utilisateurRepository.lockUserMigration();
  }
  async unlockUserMigration(): Promise<any> {
    return this.utilisateurRepository.unlockUserMigration();
  }

  async migrateUsers(): Promise<UserMigrationReport[]> {
    const version_target = UtilisateurBehavior.systemVersion();
    const result = [];
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const log = { user_id: user_id, migrations: [] };
      const utilisateur = await this.utilisateurRepository.findUtilisateurById(
        user_id,
      );
      for (
        let current_version = utilisateur.version + 1;
        current_version <= version_target;
        current_version++
      ) {
        if (!utilisateur.migration_enabled) {
          log.migrations.push({
            version: current_version,
            ok: true,
            info: 'Migrations disable for that user',
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
    const user_articles =
      await _this.interactionRepository.listInteractionsByFilter({
        utilisateurId: utilisateur.id,
        type: InteractionType.article,
        done: true,
      });
    user_articles.forEach((article) => {
      utilisateur.history.articleLu(article.content_id, article.done_at);
      utilisateur.history.likerArticle(article.content_id, article.like_level);
      if (article.points_en_poche) {
        utilisateur.history.metPointsArticleEnPoche(article.content_id);
      }
    });

    const user_quizz_done =
      await _this.interactionRepository.listInteractionsByFilter({
        utilisateurId: utilisateur.id,
        type: InteractionType.quizz,
        done: true,
      });
    user_quizz_done.forEach((quizz) => {
      utilisateur.history.quizzAttempt(
        quizz.content_id,
        quizz.quizz_score,
        quizz.done_at,
      );
      utilisateur.history.likerQuizz(quizz.content_id, quizz.like_level);
      if (quizz.points_en_poche) {
        utilisateur.history.metPointsQuizzEnPoche(quizz.content_id);
      }
    });

    return {
      ok: true,
      info: `- migrated ${user_articles.length} articles to user hisotry
- migrated ${user_quizz_done.length} quizzes to user hisotry`,
    };
  }
  private async migrate_3(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: false, info: 'to implement' };
  }
  private async migrate_4(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: false, info: 'to implement' };
  }
  private async migrate_5(
    utilisateur: Utilisateur,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: false, info: 'to implement' };
  }
}
