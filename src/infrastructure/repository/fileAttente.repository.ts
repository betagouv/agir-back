import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UtilisateurAttente } from '../../../src/domain/utilisateur/utilisateurAttente';
import { App } from '../../../src/domain/app';

@Injectable()
export class FileAttenteRepository {
  constructor(private prisma: PrismaService) {}

  async canWrite() {
    const today_start = new Date();
    today_start.setHours(0, 0, 0);

    const today_end = new Date();
    today_end.setHours(23, 59, 59);

    const today_count = await this.prisma.fileAttente.count({
      where: {
        created_at: {
          gt: today_start,
          lt: today_end,
        },
      },
    });
    return today_count < App.getMaxFileAttenteJour();
  }
  async upsert(user: UtilisateurAttente): Promise<void> {
    await this.prisma.fileAttente.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        code_postal: user.code_postal,
        code_profil: user.code_profil,
      },
      update: {
        code_postal: user.code_postal,
        code_profil: user.code_profil,
      },
    });
  }
}
