import { Injectable } from '@nestjs/common';
import { PasswordAwareUtilisateur } from '../../../../src/domain/utilisateur/manager/passwordAwareUtilisateur';
import { SecurityEmailAwareUtilisateur } from '../../../../src/domain/utilisateur/manager/securityEmailAwareUtilisateur';
import { CodeAwareUtilisateur } from '../../../domain/utilisateur/manager/codeAwareUtilisateur';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UtilisateurSecurityRepository {
  constructor(private prisma: PrismaService) {}

  async updateCodeValidationData(utilisateur: CodeAwareUtilisateur) {
    return this.prisma.utilisateur.update({
      where: {
        id: utilisateur.id,
      },
      data: {
        failed_checkcode_count: utilisateur.failed_checkcode_count,
        prevent_checkcode_before: utilisateur.prevent_checkcode_before,
        code: utilisateur.code,
      },
    });
  }
  async updateLoginAttemptData(utilisateur: PasswordAwareUtilisateur) {
    return this.prisma.utilisateur.update({
      where: {
        id: utilisateur.id,
      },
      data: {
        failed_login_count: utilisateur.failed_login_count,
        prevent_login_before: utilisateur.prevent_login_before,
        force_connexion: utilisateur.force_connexion,
      },
    });
  }
  async updateSecurityEmailEmissionData(
    utilisateur: SecurityEmailAwareUtilisateur,
  ) {
    return this.prisma.utilisateur.update({
      where: {
        id: utilisateur.id,
      },
      data: {
        sent_email_count: utilisateur.sent_email_count,
        prevent_sendemail_before: utilisateur.prevent_sendemail_before,
      },
    });
  }
}
