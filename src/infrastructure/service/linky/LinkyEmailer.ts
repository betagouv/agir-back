import { Injectable } from '@nestjs/common';
import { App } from '../../../../src/domain/app';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { EmailSender } from '../../../../src/infrastructure/email/emailSender';

@Injectable()
export class LinkyEmailer {
  constructor(private readonly emailSender?: EmailSender) {}

  async sendConfigurationKOEmail(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Finalement le PRM que vous avez saisi semble incorrect.<br>
Vous pouvez le corriger sur la page de configuration de votre service de suivi de consommation.<br><br>

<a href="${App.getBaseURLFront()}/agir/services/linky">Configuration Linky</a><br><br>

À très vite !`,
      `Suivi conso électrique : Votre PRM a été mal renseigné`,
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

<a href="${App.getBaseURLFront()}/agir/services/linky">Votre tableau de bord personnel</a><br><br>

À très vite !`,
      `Votre suivi de consommation électrique est disponible !`,
    );
  }
}
