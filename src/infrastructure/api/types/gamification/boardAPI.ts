import { ApiProperty } from '@nestjs/swagger';
import { Board } from '../../../../domain/gamification/board';
import { Classement } from '../../../../domain/gamification/classement';

export enum Pourcetile {
  pourcent_5 = 'pourcent_5',
  pourcent_10 = 'pourcent_10',
  pourcent_25 = 'pourcent_25',
  pourcent_50 = 'pourcent_50',
}

export class ClassementAPI {
  @ApiProperty() points: number;
  @ApiProperty() prenom: string;
  @ApiProperty() rank: number;

  public static mapToAPI(
    classement: Classement,
    local: boolean,
  ): ClassementAPI {
    return {
      points: classement.points,
      rank: local ? classement.rank_commune : classement.rank,
      prenom: classement.prenom,
    };
  }
}
export class ClassementLocalAPI {
  @ApiProperty({ enum: Pourcetile }) pourcentile: Pourcetile;
  @ApiProperty({ type: [ClassementAPI] }) top_trois: ClassementAPI[];
  @ApiProperty({ type: ClassementAPI }) utilisateur: ClassementAPI;
  @ApiProperty({ type: [ClassementAPI] })
  classement_utilisateur: ClassementAPI[];
  @ApiProperty() code_postal: string;
  @ApiProperty() commune_label: string;

  public static mapToAPI(board: Board): ClassementLocalAPI {
    return {
      top_trois: board.classement_local.top_trois.map((e) =>
        ClassementAPI.mapToAPI(e, true),
      ),
      utilisateur: board.classement_local.utilisateur
        ? ClassementAPI.mapToAPI(board.classement_local.utilisateur, true)
        : null,
      classement_utilisateur: board.classement_local.classement_utilisateur
        ? board.classement_local.classement_utilisateur.map((e) =>
            ClassementAPI.mapToAPI(e, true),
          )
        : null,
      code_postal: board.classement_local.code_postal,
      commune_label: board.classement_local.commune_label,
      pourcentile: board.classement_local.pourcentile,
    };
  }
}
export class ClassementNationalAPI {
  @ApiProperty({ enum: Pourcetile }) pourcentile: Pourcetile;
  @ApiProperty({ type: [ClassementAPI] }) top_trois: ClassementAPI[];
  @ApiProperty({ type: ClassementAPI }) utilisateur: ClassementAPI;
  @ApiProperty({ type: [ClassementAPI] })
  classement_utilisateur: ClassementAPI[];

  public static mapToAPI(board: Board): ClassementNationalAPI {
    return {
      top_trois: board.classement_national.top_trois.map((e) =>
        ClassementAPI.mapToAPI(e, false),
      ),
      utilisateur: board.classement_national.utilisateur
        ? ClassementAPI.mapToAPI(board.classement_national.utilisateur, false)
        : null,
      classement_utilisateur: board.classement_national.classement_utilisateur
        ? board.classement_national.classement_utilisateur.map((e) =>
            ClassementAPI.mapToAPI(e, false),
          )
        : null,
      pourcentile: board.classement_national.pourcentile,
    };
  }
}

export class BoardAPI {
  @ApiProperty({ type: ClassementLocalAPI })
  classement_local: ClassementLocalAPI;

  @ApiProperty({ type: ClassementNationalAPI })
  classement_national: ClassementNationalAPI;

  public static mapToAPI(board: Board): BoardAPI {
    return {
      classement_local: ClassementLocalAPI.mapToAPI(board),
      classement_national: ClassementNationalAPI.mapToAPI(board),
    };
  }
}
