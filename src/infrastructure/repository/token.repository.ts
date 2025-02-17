import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenRepository {
  constructor(private jwt_service: JwtService) {}

  public async createNewAppToken(utilisateurId: string): Promise<string> {
    return await this.jwt_service.signAsync({ utilisateurId });
  }
}
