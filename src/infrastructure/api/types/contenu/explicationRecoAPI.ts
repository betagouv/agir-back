import { ApiProperty } from '@nestjs/swagger';
import { ExplicationScore } from '../../../../domain/scoring/system_v2/ExplicationScore';
import { Tag_v2 } from '../../../../domain/scoring/system_v2/Tag_v2';
import { TagRepository } from '../../../repository/tag.repository';

export class ExplicationRecoElementaireAPI {
  @ApiProperty({ enum: Tag_v2 }) tag: string;
  @ApiProperty() label_explication: string;
}

export class ExplicationRecoAPI {
  @ApiProperty() est_exclu: boolean;
  @ApiProperty() liste_explications: ExplicationRecoElementaireAPI[];

  static mapToApi(exp: ExplicationScore): ExplicationRecoAPI {
    if (!exp) return undefined;

    const result: ExplicationRecoAPI = {
      liste_explications: [],
      est_exclu: false,
    };

    if (this.containsExclusion(exp)) {
      for (const element of exp.liste_explications) {
        if (element.exclusion_tag) {
          result.liste_explications.push({
            label_explication: TagRepository.getTagDefinition(
              element.exclusion_tag,
            )?.label_explication,
            tag: element.exclusion_tag,
          });
        }
      }
      result.est_exclu = true;
      return result;
    }
    for (const element of exp.liste_explications) {
      if (element.inclusion_tag) {
        result.liste_explications.push({
          label_explication: TagRepository.getTagDefinition(
            element.inclusion_tag,
          )?.label_explication,
          tag: element.inclusion_tag,
        });
      }
    }
    return result;
  }

  private static containsExclusion(exp: ExplicationScore): boolean {
    return exp.liste_explications.findIndex((e) => !!e.exclusion_tag) > -1;
  }
}
