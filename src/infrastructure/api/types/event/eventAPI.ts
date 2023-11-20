import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../../../../src/domain/utilisateur/utilisateurEvent';

export class EventAPI {
  @ApiProperty({ required: true, enum: EventType }) type: EventType;
  @ApiProperty({ required: false }) interaction_id: string;
  @ApiProperty({ required: false }) number_value: number;
}
