import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { buildCompliancePrompt } from '../ai/prompts/compliance.prompt';
import { AiComplianceResult } from '../ai/schemas/ai-compliance-result.schema';
import { ComplianceRequestDto } from './dto/compliance-request.dto';
import { EntityType } from '../match/dto/match-request.dto';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async check(userId: string, dto: ComplianceRequestDto) {
    const { entity, entityId } = await this.resolveEntity(userId, dto.entityType);

    const requirements = await this.prisma.complianceRequirement.findMany();
    const prompt = buildCompliancePrompt(
      entity as Record<string, unknown>,
      dto.entityType,
      requirements,
    );

    const aiResult = await this.ai.chat<AiComplianceResult>(prompt);

    const batch = await this.prisma.complianceCheckBatch.create({
      data: {
        ...(dto.entityType === EntityType.BUSINESS
          ? { businessId: entityId }
          : { startupId: entityId }),
        overallScore: aiResult.overallScore ?? 0,
        aiSuggestedCompliances: (aiResult.suggestedCompliances ?? []) as unknown as Prisma.InputJsonValue,
        results: {
          create: (aiResult.results ?? []).map((r) => ({
            complianceRequirementId: r.complianceRequirementId,
            status: r.status,
            isMandatory: r.isMandatory ?? false,
            currentTier: r.currentTier ?? null,
            requiredTier: r.requiredTier ?? null,
            penalty: r.penalty ?? null,
            fixSteps: r.fixSteps ?? [],
            missingActions: r.missingActions ?? [],
          })),
        },
      },
      include: { results: { include: { complianceRequirement: true } } },
    });

    return batch;
  }

  async history(userId: string, entityType: EntityType, page = 1, limit = 10) {
    const { entityId } = await this.resolveEntity(userId, entityType);
    const skip = (page - 1) * limit;
    const where =
      entityType === EntityType.BUSINESS ? { businessId: entityId } : { startupId: entityId };

    const [batches, total] = await Promise.all([
      this.prisma.complianceCheckBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkedAt: 'desc' },
        include: {
          results: {
            select: {
              status: true,
              isMandatory: true,
              complianceRequirement: { select: { name: true, category: true } },
            },
          },
        },
      }),
      this.prisma.complianceCheckBatch.count({ where }),
    ]);

    return { batches, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  private async resolveEntity(userId: string, entityType: EntityType) {
    if (entityType === EntityType.BUSINESS) {
      const entity = await this.prisma.business.findUnique({ where: { userId } });
      if (!entity) throw new NotFoundException('Business profile not found');
      return { entity, entityId: entity.id };
    } else {
      const entity = await this.prisma.startup.findUnique({ where: { userId } });
      if (!entity) throw new NotFoundException('Startup profile not found');
      return { entity, entityId: entity.id };
    }
  }
}
