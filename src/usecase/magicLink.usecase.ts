import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import {
  SourceInscription,
  Utilisateur,
} from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

const MAX_CODE_ATTEMPT = 3;

@Injectable()
export class MagicLinkUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private emailSender: EmailSender,
    private tokenRepository: TokenRepository,
  ) {}

  async validateLink(
    email: string,
    code: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    if (!email) {
      ApplicationError.throwEmailObligatoireMagicLinkError();
    }
    if (!code) {
      ApplicationError.throwCodeObligatoireMagicLinkError();
    }

    let utilisateur = await this.utilisateurRespository.findByEmail(
      email,
      'full',
    );

    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.code === null) {
      ApplicationError.throwMagicLinkUsedError();
    }
    if (utilisateur.isMagicLinkCodeExpired()) {
      ApplicationError.throwMagicLinkExpiredError();
    }

    if (utilisateur.code !== code) {
      utilisateur.failed_checkcode_count++;
      if (utilisateur.failed_checkcode_count > MAX_CODE_ATTEMPT) {
        utilisateur.failed_checkcode_count = 0;
        utilisateur.code = null;
        await this.utilisateurRespository.updateUtilisateur(utilisateur);
        ApplicationError.throwMagicLinkUsedError();
      }
      await this.utilisateurRespository.updateUtilisateur(utilisateur);
      ApplicationError.throwBadCodError();
    }

    utilisateur.code = null;
    utilisateur.active_account = true;
    await this.utilisateurRespository.updateUtilisateur(utilisateur);

    const token = await this.tokenRepository.createNewAppToken(utilisateur.id);

    return { token: token, utilisateur: utilisateur };
  }

  async sendLink(email: string, source: SourceInscription): Promise<void> {
    if (!email) {
      ApplicationError.throwEmailObligatoireMagicLinkError();
    }
    if (source && !SourceInscription[source]) {
      ApplicationError.throwSourceInscriptionInconnue(source);
    }

    Utilisateur.checkEmailFormat(email);

    let utilisateur = await this.utilisateurRespository.findByEmail(email);

    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        email,
        true,
        source || SourceInscription.magic_link,
      );

      await this.utilisateurRespository.createUtilisateur(utilisateur);
      utilisateur = await this.utilisateurRespository.findByEmail(email);
    }

    if (utilisateur.isMagicLinkCodeExpired()) {
      utilisateur.setNew6DigitCode();
    }

    await this.utilisateurRespository.updateUtilisateur(utilisateur);

    this.sendValidationCode(email, utilisateur.code);
  }

  private async sendValidationCode(email: string, code: string) {
    this.emailSender.sendEmail(
      email,
      'name',
      `Bonjour !<br>
Voici le lien pour accéder au service !<br><br>
    
<a href="${App.getBaseURLFront()}/authentification/validation-lien-magique?email=${email}&code=${code} ">Accès à l'application J'agis</a><br><br>
    
À très vite !`,
      `Lien d'accès à Jagis`,
    );
  }
}
