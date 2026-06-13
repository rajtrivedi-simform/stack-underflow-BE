import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../../match/dto/match-request.dto';

export enum DocumentType {
  APPLICATION_LETTER = 'APPLICATION_LETTER',
  COMPLIANCE_ACTION_PLAN = 'COMPLIANCE_ACTION_PLAN',
  PROFILE_REPORT = 'PROFILE_REPORT',
}

export class GenerateDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiPropertyOptional({ description: 'Required for APPLICATION_LETTER; scheme ID' })
  @IsOptional()
  @IsString()
  schemeId?: string;
}
