import { Injectable } from '@nestjs/common';
import { KYCID } from '../../src/domain/kyc/KYCID';
import {
  ModeInscription,
  Scope,
  Utilisateur,
} from '../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { App } from '../domain/app';
import { KycToTags_v2 } from '../domain/kyc/synchro/kycToTagsV2';
import { ThematiqueHistory } from '../domain/thematique/history/thematiqueHistory';
import { Thematique } from '../domain/thematique/thematique';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';

export type UserMigrationReport = {
  user_id: string;
  migrations: { version: number; ok: boolean; info: string }[];
};

@Injectable()
export class MigrationUsecase {
  constructor(
    public utilisateurRepository: UtilisateurRepository,
    public kycRepository: KycRepository,
    public communeRepository: CommuneRepository,
  ) {}

  async lockUserMigration(): Promise<any> {
    return this.utilisateurRepository.lockUserMigration();
  }
  async unlockUserMigration(): Promise<any> {
    return this.utilisateurRepository.unlockUserMigration();
  }

  async migrateUsers(): Promise<UserMigrationReport[]> {
    const version_target = App.currentUserSystemVersion();
    const result = [];
    const userIdList = await this.utilisateurRepository.listUtilisateurIds({
      migration_enabled: true,
      max_version_excluded: version_target,
    });
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const log = { user_id: user_id, migrations: [] };
      let user = await this.utilisateurRepository.getById(user_id, []);
      for (
        let current_version = user.version + 1;
        current_version <= version_target;
        current_version++
      ) {
        const migration_function =
          this['migrate_'.concat(current_version.toString())];
        if (migration_function) {
          const migration_result = await migration_function(
            user_id,
            current_version,
            this,
          );
          log.migrations.push({
            version: current_version,
            ok: migration_result.ok,
            info: migration_result.info,
          });
          if (!migration_result.ok) {
            break;
          }
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
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const user = await _this.utilisateurRepository.getById(user_id, []);
    user.version = version;
    await _this.utilisateurRepository.updateUtilisateurNoConcurency(user, [
      Scope.core,
    ]);
    return { ok: true, info: 'dummy migration' };
  }
  private async migrate_2(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_3(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_4(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    const plus_600 = utilisateur.gamification.points > 600;
    if (plus_600) {
      utilisateur.unlocked_features.add(Feature.bibliotheque);
    }
    return {
      ok: true,
      info: `revealed bilbio for user ${utilisateur.id} of ${utilisateur.gamification.points} points : ${plus_600}`,
    };
    */
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_5(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    utilisateur.logement.chauffage = utilisateur.onboardingData.chauffage;
    utilisateur.logement.code_postal = utilisateur.onboardingData.code_postal;
    utilisateur.logement.commune = utilisateur.onboardingData.commune;
    utilisateur.logement.nombre_adultes = utilisateur.onboardingData.adultes;
    utilisateur.logement.nombre_enfants = utilisateur.onboardingData.enfants;
    utilisateur.logement.proprietaire = utilisateur.onboardingData.proprietaire;
    utilisateur.logement.superficie = utilisateur.onboardingData.superficie;
    utilisateur.logement.type = utilisateur.onboardingData.residence;*/
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_6(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    utilisateur.transport.avions_par_an = utilisateur.onboardingData.avion;
    utilisateur.transport.transports_quotidiens =
      utilisateur.onboardingData.transports;
      */
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_7(utilisateur: Utilisateur) {
    /*
    let count = 0;
    for (const defi of utilisateur.defi_history.defis) {
      if (defi.getStatus() === DefiStatus.deja_fait) {
        defi.setRawStatus(DefiStatus.fait);
        count++;
      }
    }
    return {
      ok: true,
      info: `user : ${utilisateur.id} switched ${count} status deja_fait => fait`,
    };
    */
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_8(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    const kyc_def_liste = KycRepository.getCatalogue();
    const result = [];
    for (const question of utilisateur.kyc_history.getRawAnsweredKYCs()) {
      const kyc_def = kyc_def_liste.find((k) => k.code === question.code);
      if (kyc_def) {
        question.id_cms = kyc_def.id_cms;
        result.push(kyc_def.id_cms);
      }
    }
    return {
      ok: true,
      info: `CMS IDS injected ${JSON.stringify(result)}`,
    };
    */
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_9(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    //utilisateur.revenu_fiscal = null;
    //return { ok: true, info: 'set revenu_fiscal = null' };
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_10(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    utilisateur.points_classement = utilisateur.gamification.points;
    utilisateur.commune_classement = utilisateur.logement
      ? utilisateur.logement.commune
      : null;
    utilisateur.code_postal_classement = utilisateur.logement
      ? utilisateur.logement.code_postal
      : null;

    return {
      ok: true,
      info: 'migrated points/code_postal/commune pour classement',
    };
    */
    return { ok: true, info: 'Migration already done' };
  }
  private async migrate_11(
    user_id: string,
    version: number,
  ): Promise<{ ok: boolean; info: string }> {
    /*
    if (utilisateur.parcours_todo.isEndedTodo()) {
      return { ok: true, info: 'no reset, todo terminée' };
    }
    utilisateur.resetAllHistory();
    return { ok: true, info: 'reset user car todo pas terminée' };
    */
    return { ok: true, info: 'Migration already done' };
  }
  /*
  private async migrate_12(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.logement,
    ]);
    if (utilisateur.logement.code_postal && utilisateur.logement.commune) {
      const code_commune = _this.communeRepository.getCommuneCodeInsee(
        utilisateur.logement.code_postal,
        utilisateur.logement.commune,
      );
      utilisateur.code_commune = code_commune;
    }
    utilisateur.version = version;
    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core],
    );
    return {
      ok: true,
      info: `Set commune ${utilisateur.code_commune}`,
    };
  }
    */
  private async migrate_13(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
    ]);
    utilisateur.pseudo = utilisateur.prenom;
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core],
    );
    return {
      ok: true,
      info: `pseudo set ok`,
    };
  }
  private async migrate_14(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.thematique_history,
      Scope.core,
    ]);
    utilisateur.thematique_history = new ThematiqueHistory();

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history, Scope.core],
    );
    return {
      ok: true,
      info: `personnalisation reset OK`,
    };
  }
  private async migrate_15(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.gamification,
      Scope.thematique_history,
    ]);

    // DO SOMETHING
    utilisateur.resetPourLancementNational();

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.gamification, Scope.thematique_history, Scope.core],
    );

    return {
      ok: true,
      info: `reset national OK`,
    };
  }
  /*
  private async migrate_16(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
      Scope.logement,
    ]);

    // DO SOMETHING

    utilisateur.logement.code_commune = utilisateur.code_commune;

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement, Scope.core],
    );

    return {
      ok: true,
      info: `updated logement.code_commune`,
    };
  }
    */
  /*
  private async migrate_17(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.thematique_history,
      Scope.recommandation,
    ]);

    // DO SOMETHING
    utilisateur.recommandation.addListeTagActifs(
      utilisateur.thematique_history.getListeTagsExcluants(),
    );

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.recommandation, Scope.core],
    );

    return {
      ok: true,
      info: `reco tags imported OK`,
    };
  }
    */
  private async migrate_18(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.kyc,
      Scope.recommandation,
    ]);

    // DO SOMETHING
    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.recommandation,
      utilisateur.logement,
      _this.communeRepository,
    ).refreshTagState();

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core, Scope.recommandation],
    );

    return {
      ok: true,
      info: `updated reco tags`,
    };
  }
  private async migrate_19(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
    ]);

    // DO SOMETHING

    if (utilisateur.is_magic_link) {
      utilisateur.mode_inscription = ModeInscription.magic_link;
    } else if (utilisateur.passwordHash !== null) {
      utilisateur.mode_inscription = ModeInscription.mot_de_passe;
    } else if (utilisateur.france_connect_sub !== null) {
      utilisateur.mode_inscription = ModeInscription.france_connect;
    } else {
      utilisateur.mode_inscription = ModeInscription.inconnue;
    }

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core],
    );

    return {
      ok: true,
      info: `mode = [${utilisateur.mode_inscription}]`,
    };
  }
  private async migrate_20(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
      Scope.logement,
      Scope.kyc,
      Scope.recommandation,
    ]);

    // DO SOMETHING
    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.recommandation,
      utilisateur.logement,
      _this.communeRepository,
    ).refreshTagState();

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core, Scope.recommandation],
    );

    return {
      ok: true,
      info: `updated recos tags`,
    };
  }
  private async migrate_21(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
      Scope.thematique_history,
    ]);

    // DO SOMETHING
    let liste_actions_exclues: TypeCodeAction[] = [];
    for (const thematique of Object.values(Thematique)) {
      liste_actions_exclues = liste_actions_exclues.concat(
        utilisateur.thematique_history.getActionsExclues(thematique),
      );
    }
    utilisateur.thematique_history.exclureManyActions(liste_actions_exclues);

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core, Scope.thematique_history],
    );

    return {
      ok: true,
      info: `fusion actions exclues`,
    };
  }

  private async migrate_22(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const scopes = [Scope.kyc, Scope.core];
    const kycId = KYCID.KYC_gaspillage_alimentaire_frequence;
    const utilisateur = await _this.utilisateurRepository.getById(
      user_id,
      scopes,
    );

    // DO SOMETHING

    const kyc = utilisateur.kyc_history.getQuestionChoixUnique(kycId);
    if (kyc && kyc.isSelected('peu')) {
      kyc.selectByCode('zero');
      utilisateur.kyc_history.updateQuestion(kyc);
    }

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      scopes,
    );

    return {
      ok: true,
      info: `Correctly migrate answers for the KYC: ${kycId}`,
    };
  }

  private async migrate_23(
    user_id: string,
    version: number,
    _this: MigrationUsecase,
  ): Promise<{ ok: boolean; info: string }> {
    const utilisateur = await _this.utilisateurRepository.getById(user_id, [
      Scope.core,
    ]);

    // DO SOMETHING

    // VALIDATE VERSION VALUE
    utilisateur.version = version;

    await _this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.core],
    );

    return {
      ok: false,
      info: `to implement`,
    };
  }
}
