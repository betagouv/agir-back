import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LinkyConsent } from '../../../src/domain/linky/linkyConsent';

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
        mention_usage_donnees: consent.mention_usage_donnees,
        texte_signature: consent.texte_signature,
        type_donnees: consent.type_donnees,
        email: consent.email,
        nom: consent.nom,
        prenom: consent.prenom,
        prm: consent.prm,
        created_at: undefined,
        updated_at: undefined,
      },
    });
  }
}
