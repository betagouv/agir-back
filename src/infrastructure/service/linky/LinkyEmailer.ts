import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { EmailSender } from '../../../../src/infrastructure/email/emailSender';

@Injectable()
export class LinkyEmailer {
  constructor(private readonly emailSender?: EmailSender) {}

  async sendConfigurationOKEmail(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Votre service linky est bien configuré !<br> 
Encore un peu de patience et vos données de consommation seront disponibles.<br>
Généralement dans les 24h qui viennent.<br><br>

À très vite !`,
      `Bravo, vous avez bien configuré le service Linky`,
    );
  }

  async sendAvailableDataEmail(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Vous pouvez dès à présent :<br>
- voir votre consommation électrique quotidienne<br>
- consulter votre historique jusqu'à deux ans dès maintenant<br>
- comparer d'une année à l'autre l'évolution de votre consommation<br><br>

<a href="${process.env.BASE_URL_FRONT}/agir/service/linky">Votre tableau de bord personnel</a><br><br>

À très vite !`,
      `Votre suivi de consommation électrique est disponible !`,
    );
  }
}
