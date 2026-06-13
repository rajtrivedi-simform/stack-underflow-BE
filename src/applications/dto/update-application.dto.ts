import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from './create-application.dto';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ enum: ApplicationStatus }) @IsOptional() @IsEnum(ApplicationStatus) applicationStatus?: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() @IsObject() formDataSnapshot?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() generatedPdfPath?: string;
}
