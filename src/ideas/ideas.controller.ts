import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { IdeasService } from './ideas.service';
import { GenerateIdeasDto } from './dto/generate-ideas.dto';

class ApplicableSchemeDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  schemeId: string;

  @ApiProperty({ example: 'PMEGP' })
  schemeName: string;

  @ApiProperty({ example: 'Tiffin services qualify as micro food-processing enterprises under PMEGP.' })
  reason: string;

  @ApiProperty({ example: 'Provides 15–35% capital subsidy on project cost up to ₹25 lakh.' })
  benefit: string;
}

class BusinessIdeaDto {
  @ApiProperty({ example: 'Tiffin Service' })
  name: string;

  @ApiProperty({ example: 'A home-based tiffin delivery service catering to office workers and students.' })
  description: string;

  @ApiProperty({ example: '₹1,50,000 – ₹2,50,000' })
  estimatedInvestment: string;

  @ApiProperty({ example: '₹40,000 – ₹80,000' })
  potentialMonthlyRevenue: string;

  @ApiProperty({ example: 4 })
  paybackPeriodMonths: number;

  @ApiProperty({ example: ['Cooking', 'Logistics', 'Customer service'], isArray: true, type: String })
  requiredSkills: string[];

  @ApiProperty({ enum: ['HIGH', 'MEDIUM', 'LOW'], example: 'HIGH' })
  marketDemand: string;

  @ApiProperty({ example: 'Office workers, students, and working professionals' })
  targetCustomers: string;

  @ApiProperty({ example: ['Low startup cost', 'High repeat demand'], isArray: true, type: String })
  pros: string[];

  @ApiProperty({ example: ['Perishable product', 'Logistics dependency'], isArray: true, type: String })
  cons: string[];

  @ApiPropertyOptional({ example: 'Eligible for PMEGP subsidy reducing net investment by 25%', nullable: true })
  schemeAlignment: string | null;

  @ApiProperty({ example: ['Register on FSSAI portal', 'Source packaging materials', 'Launch on Swiggy/Zomato'], isArray: true, type: String })
  firstSteps: string[];

  @ApiProperty({ type: [ApplicableSchemeDto] })
  applicableSchemes: ApplicableSchemeDto[];
}

class GenerateIdeasResponseDto {
  @ApiProperty({ type: [BusinessIdeaDto] })
  ideas: BusinessIdeaDto[];

  @ApiPropertyOptional({ example: 'PMEGP', nullable: true })
  schemeUsed: string | null;
}

@ApiTags('ideas')
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI business ideas based on locality, budget, and optional scheme',
    description:
      'Returns 5 AI-generated business ideas suitable for the given locality and budget. ' +
      'Each idea lists eligible government schemes from the database with the reason and benefit. ' +
      'Optionally pin a specific scheme UUID to align all ideas toward that scheme.',
  })
  @ApiOkResponse({ type: GenerateIdeasResponseDto })
  generate(@Body() dto: GenerateIdeasDto) {
    return this.ideasService.generate(dto);
  }
}
