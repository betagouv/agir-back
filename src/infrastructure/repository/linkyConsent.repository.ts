import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LinkyConsent } from '../../../src/domain/linky/linkyConsent';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LinkyConsentRepository {
  constructor(private prisma: PrismaService) {}

  async insert(consent: LinkyConsent): Promise<void> {
    await this.prisma.linkyConsentement.create({
      data: {
        id: uuidv4(),
        utilisateurId: consent.utilisateurId,
        date_consentement: consent.date_consentement,
        date_fin_consentement: consent.date_fin_consentement,
        texte_signature: consent.texte_signature,
        email: consent.email,
        nom: consent.nom,
        prm: consent.prm,
        ip_address: consent.ip_address,
        user_agent: consent.user_agent,
        created_at: undefined,
        updated_at: undefined,
      },
    });
  }
}
