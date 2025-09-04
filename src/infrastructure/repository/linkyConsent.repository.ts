import { Injectable } from '@nestjs/common';
import { LinkyConsent } from '../../../src/domain/linky/linkyConsent';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LinkyConsentRepository {
  constructor(private prisma: PrismaService) {}

  async insert(consent: LinkyConsent): Promise<void> {
    await this.prisma.linkyConsentement.create({
      data: {
        id: consent.id,
        utilisateurId: consent.utilisateurId,
        date_consentement: consent.date_consentement,
        date_fin_consentement: consent.date_fin_consentement,
        texte_signature: consent.texte_signature,
        email: consent.email,
        nom: consent.nom,
        prm: consent.prm,
        ip_address: consent.ip_address,
        user_agent: consent.user_agent,
        unsubscribed_prm: false,
        created_at: undefined,
        updated_at: undefined,
      },
    });
  }

  async unsunbscribe_prm(consent_id: string) {
    await this.prisma.linkyConsentement.update({
      where: {
        id: consent_id,
      },
      data: {
        unsubscribed_prm: true,
      },
    });
  }

  async countAll(): Promise<number> {
    return await this.prisma.linkyConsentement.count();
  }

  async listPaginatedActivePRMs(
    skip: number,
    take: number,
  ): Promise<LinkyConsent[]> {
    const results = await this.prisma.linkyConsentement.findMany({
      skip: skip,
      take: take,
      orderBy: {
        id: 'desc',
      },
      where: {
        unsubscribed_prm: false,
      },
    });
    return results.map((r) => ({
      id: r.id,
      date_consentement: r.date_consentement,
      date_fin_consentement: r.date_fin_consentement,
      email: r.email,
      ip_address: r.ip_address,
      nom: r.nom,
      prm: r.prm,
      texte_signature: r.texte_signature,
      user_agent: r.user_agent,
      utilisateurId: r.utilisateurId,
      unsubscribed_prm: r.unsubscribed_prm,
    }));
  }
}
