import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsArray,
  Max,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty() @IsString() businessName: string;
  @ApiProperty() @IsString() ownerName: string;
  @ApiProperty() @IsString() constitution: string;
  @ApiProperty() @IsString() sector: string;
  @ApiProperty() @IsString() state: string;
  @ApiProperty() @IsString() district: string;
  @ApiPropertyOptional() @IsOptional() @IsString() taluka?: string;
  @ApiProperty() @IsInt() @Min(1900) @Max(new Date().getFullYear()) yearEstablished: number;
  @ApiPropertyOptional() @IsOptional() @IsString() productionStart?: string;

  @ApiProperty({ example: '< 40 Lakh' }) @IsString() annualTurnoverRange: string;
  @ApiProperty({ example: '< 1 Cr' }) @IsString() investmentPlantMachinery: string;

  @ApiProperty() @IsInt() @Min(0) totalEmployees: number;
  @ApiProperty() @IsInt() @Min(0) maleEmployees: number;
  @ApiProperty() @IsInt() @Min(0) femaleEmployees: number;

  @ApiProperty() @IsString() gstStatus: string;
  @ApiPropertyOptional() @IsOptional() @IsString() udyamNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() existingRegistrations?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() pendingNotices?: boolean;

  @ApiProperty() @IsString() ownerGender: string;
  @ApiProperty() @IsString() ownerAgeGroup: string;
  @ApiProperty() @IsString() socialCategory: string;
  @ApiProperty() @IsString() education: string;
  @ApiProperty() @IsString() womenLed: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() bplCard?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() knownSchemes?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() documentsOnFile?: string[];
}
