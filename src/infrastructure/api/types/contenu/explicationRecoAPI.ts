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
  @ApiProperty({ type: [ExplicationRecoElementaireAPI] })
  liste_explications: ExplicationRecoElementaireAPI[];

  static mapToApi(exp: ExplicationScore): ExplicationRecoAPI {
    if (!exp) return undefined;

    const result: ExplicationRecoAPI = {
      liste_explications: [],
      est_exclu: false,
    };

    if (exp.doesContainAnyExclusion()) {
      for (const element of exp.listeUniqueExplications()) {
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
    } else {
      for (const element of exp.listeUniqueExplications()) {
        if (element.inclusion_tag) {
          result.liste_explications.push({
            label_explication: TagRepository.getTagDefinition(
              element.inclusion_tag,
            )?.label_explication,
            tag: element.inclusion_tag,
          });
        }
      }
    }
    return result;
  }
}
