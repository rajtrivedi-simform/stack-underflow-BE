import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../../match/dto/match-request.dto';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateApplicationDto {
  @ApiProperty({ enum: EntityType }) @IsEnum(EntityType) entityType: EntityType;
  @ApiProperty() @IsString() schemeId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() portalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() formDataSnapshot?: Record<string, unknown>;
}
