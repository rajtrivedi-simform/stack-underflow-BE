import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GenerateIdeasDto {
  @ApiProperty({ example: 'Ahmedabad, Gujarat', description: 'City, district, or state where the business will operate' })
  @IsString()
  locality: string;

  @ApiProperty({ example: 500000, description: 'Available budget in INR' })
  @IsNumber()
  @Min(1000)
  @Max(100_000_000)
  budget: number;

  @ApiPropertyOptional({ description: 'Optional scheme UUID — ideas will be aligned to this scheme' })
  @IsOptional()
  @IsUUID()
  schemeId?: string;
}
