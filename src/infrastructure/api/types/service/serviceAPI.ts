import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../../src/domain/thematique';
import { Service } from '../../../../domain/service/service';

export class ServiceAPI {
  @ApiProperty() id: string;
  @ApiProperty() label: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() image_url: string;
  @ApiProperty() is_url_externe?: boolean;
  @ApiProperty() is_local: boolean;
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];

  static mapServicesToServicesAPI(service: Service): ServiceAPI {
    return {
      id: service.id,
      label: service.label,
      titre: service.titre,
      url: service.url,
      icon_url: service.icon_url,
      image_url: service.image_url,
      is_local: service.is_local,
      is_url_externe: service.is_url_externe,
      thematiques: service.thematiques,
    };
  }
}
