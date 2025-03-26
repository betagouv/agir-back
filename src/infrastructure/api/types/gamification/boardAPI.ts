import { ApiProperty } from '@nestjs/swagger';
import { BadgeCatalogue } from '../../../../domain/gamification/badgeCatalogue';
import { Board, Pourcentile } from '../../../../domain/gamification/board';
import { Classement } from '../../../../domain/gamification/classement';
import { BadgeAPI } from './gamificationAPI';
var crypto = require('crypto');

export class ClassementAPI {
  @ApiProperty() id: string;
  @ApiProperty() points: number;
  @ApiProperty() pseudo: string;
  @ApiProperty() rank: number;

  public static mapToAPI(
    classement: Classement,
    local: boolean,
  ): ClassementAPI {
    return {
      points: classement.points,
      rank: local ? classement.rank_commune : classement.rank,
      pseudo: classement.pseudo,
      id: crypto
        .createHash('md5')
        .update(classement.utilisateurId)
        .digest('hex'),
    };
  }
}

export class BoardAPI {
  @ApiProperty({ enum: Pourcentile }) pourcentile: Pourcentile;
  @ApiProperty({ type: [ClassementAPI] }) top_trois: ClassementAPI[];
  @ApiProperty({ type: ClassementAPI }) utilisateur: ClassementAPI;
  @ApiProperty({ type: [ClassementAPI] })
  classement_utilisateur: ClassementAPI[];
  @ApiProperty() code_postal: string;
  @ApiProperty() commune_label: string;
  @ApiProperty({ type: [BadgeAPI] }) badges: BadgeAPI[];

  public static mapToAPI(board: Board, local: boolean): BoardAPI {
    return {
      top_trois: board.top_trois.map((e) => ClassementAPI.mapToAPI(e, local)),
      utilisateur: board.utilisateur
        ? ClassementAPI.mapToAPI(board.utilisateur, local)
        : null,
      classement_utilisateur: board.classement_utilisateur
        ? board.classement_utilisateur.map((e) =>
            ClassementAPI.mapToAPI(e, local),
          )
        : null,
      pourcentile: board.pourcentile,
      code_postal: board.code_postal,
      commune_label: board.commune_label,
      badges: board.badges.map((b) =>
        BadgeAPI.mapToApi(BadgeCatalogue.getBadge(b)),
      ),
    };
  }
}
