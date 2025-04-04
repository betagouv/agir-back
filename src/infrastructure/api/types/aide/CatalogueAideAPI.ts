import { ApiProperty } from '@nestjs/swagger';
import { Aide } from '../../../../domain/aides/aide';
import { Utilisateur } from '../../../../domain/utilisateur/utilisateur';
import { AideAPI } from './AideAPI';

export class CatalogueAideAPI {
  @ApiProperty() couverture_aides_ok: boolean;
  @ApiProperty({ type: [AideAPI] }) liste_aides: AideAPI[];

  public static mapToAPI(
    aides: Aide[],
    utilisateur: Utilisateur,
  ): CatalogueAideAPI {
    return {
      couverture_aides_ok: utilisateur.couverture_aides_ok,
      liste_aides: aides.map((a) => AideAPI.mapToAPI(a)),
    };
  }
}
