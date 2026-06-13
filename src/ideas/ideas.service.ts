import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { SchemesService } from '../schemes/schemes.service';
import { buildBusinessIdeasPrompt } from '../ai/prompts/business-ideas.prompt';
import { GenerateIdeasDto } from './dto/generate-ideas.dto';

export interface ApplicableScheme {
  schemeId: string;
  schemeName: string;
  reason: string;
  benefit: string;
}

export interface BusinessIdea {
  name: string;
  description: string;
  estimatedInvestment: string;
  potentialMonthlyRevenue: string;
  paybackPeriodMonths: number;
  requiredSkills: string[];
  marketDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  targetCustomers: string;
  pros: string[];
  cons: string[];
  schemeAlignment: string | null;
  firstSteps: string[];
  applicableSchemes: ApplicableScheme[];
}

interface AiIdeasResult {
  ideas: BusinessIdea[];
}

@Injectable()
export class IdeasService {
  constructor(
    private readonly ai: AiService,
    private readonly schemes: SchemesService,
  ) {}

  async generate(dto: GenerateIdeasDto): Promise<{ ideas: BusinessIdea[]; schemeUsed: string | null }> {
    let scheme: { schemeName: string; eligibility: string | null; benefits: string | null } | null = null;

    if (dto.schemeId) {
      try {
        const found = await this.schemes.findOne(dto.schemeId);
        scheme = {
          schemeName: found.schemeName,
          eligibility: (found as Record<string, unknown>).eligibility as string | null ?? null,
          benefits: (found as Record<string, unknown>).benefits as string | null ?? null,
        };
      } catch {
        throw new NotFoundException(`Scheme with id "${dto.schemeId}" not found`);
      }
    }

    const allSchemes = await this.schemes.findManyForAi();

    const prompt = buildBusinessIdeasPrompt({
      locality: dto.locality,
      budget: dto.budget,
      scheme,
      availableSchemes: allSchemes,
    });
    const result = await this.ai.chat<AiIdeasResult>(prompt);

    return {
      ideas: result.ideas ?? [],
      schemeUsed: scheme?.schemeName ?? null,
    };
  }
}
