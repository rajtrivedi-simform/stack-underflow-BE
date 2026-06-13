import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AiService } from '../ai/ai.service';
import { SchemesService } from '../schemes/schemes.service';
import { BusinessesService } from '../businesses/businesses.service';
import { StartupsService } from '../startups/startups.service';
import { buildBusinessMatchPrompt } from '../ai/prompts/business-match.prompt';
import { buildStartupMatchPrompt } from '../ai/prompts/startup-match.prompt';
import { EntityType, MatchRequestDto } from './dto/match-request.dto';

const MATCH_CACHE_TTL = 3600;

interface AiMatchResult {
  matches: Array<{
    schemeId: string;
    status: string;
    matchScore: number;
    confidenceScore: number;
    metCriteria: string[];
    unmetCriteria: string[];
    gapBridgeSteps: unknown[];
    remediationCost?: string;
    remediationEffort?: string;
    unlocksOtherSchemes?: string[];
  }>;
}

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly ai: AiService,
    private readonly schemes: SchemesService,
    private readonly businesses: BusinessesService,
    private readonly startups: StartupsService,
  ) {}

  async match(userId: string, dto: MatchRequestDto) {
    const cacheKey = `match:${crypto
      .createHash('sha256')
      .update(`${userId}:${dto.entityType}`)
      .digest('hex')}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const { entity, entityId } = await this.resolveEntity(userId, dto.entityType);
    const allSchemes = await this.schemes.findManyForMatch(dto.entityType);

    const prompt =
      dto.entityType === EntityType.BUSINESS
        ? buildBusinessMatchPrompt(entity as Record<string, unknown>, allSchemes)
        : buildStartupMatchPrompt(entity as Record<string, unknown>, allSchemes);

    const aiResult = await this.ai.chat<AiMatchResult>(prompt);

    const matchData = aiResult.matches ?? [];

    await this.prisma.$transaction(
      matchData.map((m) =>
        this.prisma.schemeMatch.upsert({
          where: {
            id: `${entityId}-${m.schemeId}`,
          },
          create: {
            ...(dto.entityType === EntityType.BUSINESS
              ? { businessId: entityId }
              : { startupId: entityId }),
            schemeId: m.schemeId,
            status: m.status,
            matchScore: m.matchScore,
            confidenceScore: m.confidenceScore,
            metCriteria: m.metCriteria,
            unmetCriteria: m.unmetCriteria,
            gapBridgeSteps: m.gapBridgeSteps as unknown as Prisma.InputJsonValue,
            remediationCost: m.remediationCost ?? null,
            remediationEffort: m.remediationEffort ?? null,
            unlocksOtherSchemes: m.unlocksOtherSchemes ?? [],
          },
          update: {
            status: m.status,
            matchScore: m.matchScore,
            confidenceScore: m.confidenceScore,
            metCriteria: m.metCriteria,
            unmetCriteria: m.unmetCriteria,
            gapBridgeSteps: m.gapBridgeSteps as unknown as Prisma.InputJsonValue,
            remediationCost: m.remediationCost ?? null,
            remediationEffort: m.remediationEffort ?? null,
            unlocksOtherSchemes: m.unlocksOtherSchemes ?? [],
          },
        }),
      ),
    );

    const result = {
      entityType: dto.entityType,
      total: matchData.length,
      eligible: matchData.filter((m) => m.status === 'ELIGIBLE').length,
      matches: matchData.sort((a, b) => b.matchScore - a.matchScore),
    };

    await this.redis.set(cacheKey, result, MATCH_CACHE_TTL);
    return result;
  }

  async history(userId: string, entityType: EntityType, page = 1, limit = 20) {
    const { entityId } = await this.resolveEntity(userId, entityType);
    const skip = (page - 1) * limit;
    const where =
      entityType === EntityType.BUSINESS ? { businessId: entityId } : { startupId: entityId };

    const [matches, total] = await Promise.all([
      this.prisma.schemeMatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { matchedAt: 'desc' },
        include: { scheme: { select: { schemeName: true, applicationLink: true, level: true } } },
      }),
      this.prisma.schemeMatch.count({ where }),
    ]);

    return { matches, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  private async resolveEntity(userId: string, entityType: EntityType) {
    if (entityType === EntityType.BUSINESS) {
      const entity = await this.prisma.business.findUnique({ where: { userId } });
      if (!entity) throw new NotFoundException('Business profile not found. Please create one first.');
      return { entity, entityId: entity.id };
    } else {
      const entity = await this.prisma.startup.findUnique({ where: { userId } });
      if (!entity) throw new NotFoundException('Startup profile not found. Please create one first.');
      return { entity, entityId: entity.id };
    }
  }
}
