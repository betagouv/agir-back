import {
  SourceInscription,
  Utilisateur,
} from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { ApplicationError } from '../infrastructure/applicationError';
import { App } from '../domain/app';

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
    private oidcService: OidcService,
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

    let utilisateur = await this.utilisateurRespository.findByEmail(email);

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
        await this.utilisateurRespository.updateUtilisateur(
          utilisateur,
          'validateLink',
        );
        ApplicationError.throwMagicLinkUsedError();
      }
      await this.utilisateurRespository.updateUtilisateur(
        utilisateur,
        'validateLink',
      );
      ApplicationError.throwBadCodError();
    }

    utilisateur.code = null;
    utilisateur.active_account = true;
    await this.utilisateurRespository.updateUtilisateur(
      utilisateur,
      'validateLink',
    );

    const token = await this.oidcService.createNewInnerAppToken(utilisateur.id);

    return { token: token, utilisateur: utilisateur };
  }

  async sendLink(email: string): Promise<void> {
    if (!email) {
      ApplicationError.throwEmailObligatoireMagicLinkError();
    }
    Utilisateur.checkEmailFormat(email);

    let utilisateur = await this.utilisateurRespository.findByEmail(email);

    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        'NOM',
        'PRENOM',
        email,
        null,
        null,
        null,
        true,
        SourceInscription.inconnue,
      );

      await this.utilisateurRespository.createUtilisateur(utilisateur);
      utilisateur = await this.utilisateurRespository.findByEmail(email);
    }

    if (utilisateur.isMagicLinkCodeExpired()) {
      utilisateur.setNew6DigitCode();
    }

    await this.utilisateurRespository.updateUtilisateur(
      utilisateur,
      'sendLink',
    );

    this.sendValidationCode(email, utilisateur.code);
  }

  private async sendValidationCode(email: string, code: string) {
    this.emailSender.sendEmail(
      email,
      'name',
      `Bonjour !<br>
Voici votre code pour accédder à l'application Agir !<br><br>
    
CODE : <strong>${code}</strong><br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien pour un accès directe, sans même saisir le code !!! : <a href="${App.getBaseURLBack()}/utilisateurs/${email}/login?code=${code}">Accès à l'application Agir</a><br><br>
    
À très vite !`,
      `Votre code Agir : ${code}`,
    );
  }
}
