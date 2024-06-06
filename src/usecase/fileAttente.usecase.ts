import { Injectable } from '@nestjs/common';
import { FileAttenteRepository } from '../../src/infrastructure/repository/fileAttente.repository';
import {
  Profil,
  UtilisateurAttente,
} from '../../src/domain/utilisateur/utilisateurAttente';
import { App } from '../../src/domain/app';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class FileAttenteUsecase {
  constructor(
    private fileAttenteRepository: FileAttenteRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async hasAccess(email: string): Promise<{
    white_listed: boolean;
    registered: boolean;
  }> {
    if (!email) {
      return { white_listed: false, registered: false };
    }
    const registered = await this.utilisateurRepository.checkEmailExists(email);
    return {
      white_listed: App.doesAnyWhiteListIncludes(email),
      registered: registered,
    };
  }

  async add(user: UtilisateurAttente): Promise<void> {
    const can_write = await this.fileAttenteRepository.canWrite();
    if (!can_write) {
      ApplicationError.throwToManyAttenteForToday();
    }
    let ok = true;

    ok = ok && !!user.email;
    ok = ok && !!user.code_postal;
    ok = ok && !!user.code_profil;

    ok = ok && user.email.length < 50;
    ok = ok && user.email.length > 5;

    ok = ok && user.code_postal.length === 5;

    ok = ok && !!Profil[user.code_profil];

    if (!ok) {
      ApplicationError.throwBadInputsForFileAttente();
    }
    await this.fileAttenteRepository.upsert(user);
  }
}
