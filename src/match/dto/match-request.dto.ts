import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum EntityType {
  BUSINESS = 'BUSINESS',
  STARTUP = 'STARTUP',
}

export class MatchRequestDto {
  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;
}
