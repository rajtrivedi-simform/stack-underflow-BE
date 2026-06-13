import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GenerateIdeasDto {
  @ApiProperty({
    example: 'Ahmedabad, Gujarat',
    description: 'City, district, or state where the business will operate',
  })
  @IsString()
  locality: string;

  @ApiProperty({
    example: 500000,
    description: 'Available startup budget in INR (min ₹1,000 — max ₹10 Cr)',
    minimum: 1000,
    maximum: 100_000_000,
  })
  @IsNumber()
  @Min(1000)
  @Max(100_000_000)
  budget: number;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID of a government scheme — returned ideas will be aligned to and eligible for this scheme',
  })
  @IsOptional()
  @IsUUID()
  schemeId?: string;
}
