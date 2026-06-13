import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSchemeDto {
  @ApiProperty() @IsString() schemeName: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() details?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() benefits?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eligibility?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() application?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() documents?: string[];
  @ApiProperty({ example: 'CENTRAL' }) @IsString() level: string;
  @ApiPropertyOptional() @IsOptional() schemeCategory?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() targetCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() applicableStates?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() applicationLink?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
