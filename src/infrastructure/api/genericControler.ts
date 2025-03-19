import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { Request } from 'express';
import { App } from '../../../src/domain/app';
import { Consultation } from '../../domain/actions/catalogueAction';
import { TypeAction } from '../../domain/actions/typeAction';
import { ContentType } from '../../domain/contenu/contentType';
import { IncludeArticle } from '../../domain/contenu/includeArticle';
import { Thematique } from '../../domain/thematique/thematique';
import { ApplicationError } from '../applicationError';
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

  public getURLFromRequest(req: Request): string {
    return `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
  }

  public getStringListFromStringArrayAPIInput(input): string[] {
    if (input) {
      const isString = typeof input === 'string' || input instanceof String;
      if (isString) {
        return [input as string];
      } else {
        return input;
      }
    }
    return [];
  }

  public castThematiqueOrException(code_thematique: string): Thematique {
    const thematique = Thematique[code_thematique];
    if (!thematique) {
      ApplicationError.throwThematiqueNotFound(code_thematique);
    }
    return thematique;
  }
  public castContentTypeOrException(code_type: string): ContentType {
    const type = ContentType[code_type];
    if (!type) {
      ApplicationError.throwContentTypeNotFound(code_type);
    }
    return type;
  }

  public castTypeActionOrException(type_action: string): TypeAction {
    const type = TypeAction[type_action];
    if (!type) {
      ApplicationError.throwTypeActionNotFound(type_action);
    }
    return type;
  }

  public castIncludeArticleOrException(include: string): IncludeArticle {
    if (!include) return IncludeArticle.tout;
    const value = IncludeArticle[include];
    if (!value) {
      ApplicationError.throwTypeIncludeNotFound(include);
    }
    return value;
  }

  public castTypeConsultationActionOrException(
    consultation: string,
  ): Consultation {
    if (!consultation) return Consultation.tout;
    const type = Consultation[consultation];
    if (!type) {
      ApplicationError.throwTypeConsultationNotFound(consultation);
    }
    return type;
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
