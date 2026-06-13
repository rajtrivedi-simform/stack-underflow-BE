import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EntityType } from '../../match/dto/match-request.dto';

export class ComplianceRequestDto {
  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;
}
