import { ApiProperty } from '@nestjs/swagger';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { AideAPI } from './AideAPI';
import { Utilisateur } from '../../../../domain/utilisateur/utilisateur';

export class AideAPI_v2 {
  @ApiProperty() couverture_aides_ok: boolean;
  @ApiProperty({ type: [AideAPI] }) liste_aides: AideAPI[];

  public static mapToAPI(
    aides: AideDefinition[],
    utilisateur: Utilisateur,
  ): AideAPI_v2 {
    return {
      couverture_aides_ok: utilisateur.couverture_aides_ok,
      liste_aides: aides.map((a) => AideAPI.mapToAPI(a)),
    };
  }
}
