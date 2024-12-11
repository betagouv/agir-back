import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  Response,
} from '@nestjs/common';
import { Response as Res } from 'express';
import {
  ApiBearerAuth,
  ApiExcludeController,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { KycRepository } from '../repository/kyc.repository';
import { NGCCalculator } from '../ngc/NGCCalculator';
import { MissionRepository } from '../repository/mission.repository';
import { ArticleRepository } from '../repository/article.repository';
import { QuizzRepository } from '../repository/quizz.repository';
import { DefiRepository } from '../repository/defi.repository';
import { MissionUsecase } from '../../usecase/mission.usecase';
import { App } from '../../domain/app';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { Scope } from '../../domain/utilisateur/utilisateur';
import { AideRepository } from '../repository/aide.repository';

export class SyntheseAPI {
  @ApiProperty() nombre_inscrits: number;
  @ApiProperty() nombre_points_moyen: number;
  @ApiProperty() nombre_aides_total: number;
  @ApiProperty() nombre_aides_nat_total: number;
  @ApiProperty() nombre_aides_region_total: number;
  @ApiProperty() nombre_aides_departement_total: number;
  @ApiProperty() nombre_aides_commune_total: number;
}

@ApiTags('Previews')
@Controller()
@ApiBearerAuth()
export class SyntheseController extends GenericControler {
  constructor(
    private userRepository: UtilisateurRepository,
    private kycRepository: KycRepository,
    private nGCCalculator: NGCCalculator,
    private missionRepository: MissionRepository,
    private articleRepository: ArticleRepository,
    private missionUsecase: MissionUsecase,
    private quizzRepository: QuizzRepository,
    private defiRepository: DefiRepository,
    private aideRepository: AideRepository,
  ) {
    super();
  }

  @Get('code_postal_synthese/:code_postal')
  @ApiOkResponse({ type: SyntheseAPI })
  async code_postal_synthese(
    //@Headers('Authorization') authorization: string,
    @Param('code_postal') code_postal: string,
    @Response() res: Res,
  ): Promise<any> {
    /*
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }
      */

    const user_ids_code_postal = await this.userRepository.listUtilisateurIds(
      undefined,
      undefined,
      undefined,
      code_postal,
    );

    let nombre_points_moyen = 0;

    for (const userid of user_ids_code_postal) {
      const user = await this.userRepository.getById(userid, [
        Scope.gamification,
      ]);
      nombre_points_moyen += user.gamification.points;
    }
    if (user_ids_code_postal.length > 0) {
      nombre_points_moyen = nombre_points_moyen / user_ids_code_postal.length;
    }

    const aides_dispo = await this.aideRepository.search({
      code_postal: code_postal,
    });

    let count_aide_nat = 0;
    let count_aide_region = 0;
    let count_aide_departement = 0;
    let count_aide_commune = 0;
    for (const aide of aides_dispo) {
      if (
        aide.codes_postaux.length > 0 ||
        aide.include_codes_commune.length > 0
      ) {
        count_aide_commune++;
      }
      if (aide.codes_departement.length > 0) {
        count_aide_departement++;
      }
      if (aide.codes_region.length > 0) {
        count_aide_region++;
      }
      if (
        aide.codes_departement.length == 0 &&
        aide.codes_region.length === 0 &&
        aide.codes_postaux.length === 0 &&
        aide.include_codes_commune.length === 0
      ) {
        count_aide_nat++;
      }
    }
    return res.json({
      nombre_inscrits: user_ids_code_postal.length,
      nombre_points_moyen: nombre_points_moyen,
      nombre_aides_total: aides_dispo.length,
      nombre_aides_nat_total: count_aide_nat,
      nombre_aides_region_total: count_aide_region,
      nombre_aides_departement_total: count_aide_departement,
      nombre_aides_commune_total: count_aide_commune,
    });
  }

  private returnBadOreMissingLoginError(res: Res) {
    return res
      .set({ 'WWW-Authenticate': 'Basic realm=preview' })
      .status(401)
      .send('Bad or missing login / password');
  }
  private checkAuthHeaderOK(header: string): boolean {
    if (!header || !header.startsWith('Basic ')) {
      return false;
    }
    const base64 = header.split(' ').pop();
    return App.getBasicLoginPwdBase64() == base64;
  }
}
