import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import { App } from '../../../src/domain/app';
import { AuthGuard } from '../auth/guard';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { ControllerExceptionFilter } from './controllerException.filter';

@UseFilters(new ControllerExceptionFilter())
@Injectable()
export class GenericControler {
  @Inject()
  private utilisateurRepository: UtilisateurRepository;

  checkCallerId(req: Request, utilisateurId: string) {
    if (AuthGuard.getUtilisateurIdFromTokenInRequest(req) !== utilisateurId) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à ces données',
      });
    }
    // Asynchronous
    this.utilisateurRepository
      .update_last_activite(utilisateurId)
      .catch(() => {});
  }

  checkCallerIsAdmin(req: Request) {
    if (!this.isCallerAdmin(req)) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à cette API',
      });
    }
  }

  isCallerAdmin(req: Request) {
    return App.isAdmin(AuthGuard.getUtilisateurIdFromTokenInRequest(req));
  }

  checkCronAPIProtectedEndpoint(request: Request) {
    const authorization = request.headers['authorization'] as string;
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(App.getCronAPIKey())) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
  }
}
