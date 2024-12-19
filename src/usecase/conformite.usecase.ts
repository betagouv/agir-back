import { Injectable } from '@nestjs/common';

import { ConformiteRepository } from '../infrastructure/repository/conformite.repository';
import { ConformiteDefinition } from '../domain/contenu/conformiteDefinition';
import { ApplicationError } from '../infrastructure/applicationError';

@Injectable()
export class ConformiteUsecase {
  async getPageConfiormite(code_page: string): Promise<ConformiteDefinition> {
    const page = ConformiteRepository.getByCode(code_page);
    if (!page) {
      ApplicationError.throwConformitePageNotFound(code_page);
    }
    return page;
  }
}
