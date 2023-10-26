import { ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
export class GenericControler {
  checkCallerId(req: Request, utilisateurId: string) {
    if (req['tokenUtilisateurId'] !== utilisateurId) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à ces données',
      });
    }
  }
}
