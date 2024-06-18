import { ApiProperty } from '@nestjs/swagger';
import { Gamification } from '../../../../domain/gamification/gamification';
import {
  Celebration,
  CelebrationType,
} from '../../../../domain/gamification/celebrations/celebration';
import { Feature } from '../../../../../src/domain/gamification/feature';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';

export class RevealAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: Feature }) feature: Feature;
  @ApiProperty() titre: string;
  @ApiProperty() description: string;
}
export class CelebrationAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CelebrationType }) type: CelebrationType;
  @ApiProperty() titre: string;
  @ApiProperty({ required: false }) new_niveau?: number;
  @ApiProperty({ required: false }) reveal?: RevealAPI;

  @ApiProperty()
  thematique_univers_label?: string;
  @ApiProperty({ type: [String] })
  new_thematiques_labels?: string[];

  public static mapToAPI(celeb: Celebration): CelebrationAPI {
    return {
      id: celeb.id,
      type: celeb.type,
      titre: celeb.titre,
      new_niveau: celeb.new_niveau,
      reveal: celeb.reveal,
      thematique_univers_label: celeb.thematique_univers
        ? ThematiqueRepository.getTitreThematiqueUnivers(
            celeb.thematique_univers,
          )
        : undefined,
      new_thematiques_labels: celeb.new_thematiques
        ? celeb.new_thematiques.map((n) =>
            ThematiqueRepository.getTitreThematiqueUnivers(n),
          )
        : undefined,
    };
  }
}
export class GamificationAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;
  @ApiProperty({ type: [CelebrationAPI] }) celebrations: CelebrationAPI[];

  public static mapToAPI(gamif: Gamification): GamificationAPI {
    return {
      points: gamif.points,
      niveau: gamif.getNiveau(),
      current_points_in_niveau: gamif.getCurrent_points_in_niveau(),
      point_target_in_niveau: gamif.getPoint_target_in_niveau(),
      celebrations: gamif.celebrations
        ? gamif.celebrations.map((c) => CelebrationAPI.mapToAPI(c))
        : [],
    };
  }
}
