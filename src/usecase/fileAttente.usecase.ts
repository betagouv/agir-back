import { Injectable } from '@nestjs/common';
import { FileAttenteRepository } from '../../src/infrastructure/repository/fileAttente.repository';
import { UtilisateurAttente } from '../../src/domain/utilisateur/utilisateurAttente';
import { App } from '../../src/domain/app';
import { ApplicationError } from '../../src/infrastructure/applicationError';

@Injectable()
export class FileAttenteUsecase {
  constructor(private fileAttenteRepository: FileAttenteRepository) {}

  hasAccess(email: string): boolean {
    return App.doesAnyWhiteListIncludes(email);
  }

  async add(user: UtilisateurAttente): Promise<void> {
    const can_write = await this.fileAttenteRepository.canWrite();
    if (can_write) {
      await this.fileAttenteRepository.upsert(user);
    } else {
      ApplicationError.throwToManyAttenteForToday();
    }
  }
}
