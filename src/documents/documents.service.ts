import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { buildApplicationLetterPrompt } from '../ai/prompts/application-letter.prompt';
import { buildComplianceActionPlanPrompt } from '../ai/prompts/compliance-action-plan.prompt';
import { buildProfileReportPrompt } from '../ai/prompts/profile-report.prompt';
import { DocumentType, GenerateDocumentDto } from './dto/generate-document.dto';
import { EntityType } from '../match/dto/match-request.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async generate(userId: string, dto: GenerateDocumentDto) {
    const { entity, entityId } = await this.resolveEntity(userId, dto.entityType);

    let prompt: string;
    let schemeId: string | undefined;

    if (dto.documentType === DocumentType.APPLICATION_LETTER) {
      if (!dto.schemeId) throw new BadRequestException('schemeId is required for APPLICATION_LETTER');
      const scheme = await this.prisma.scheme.findUniqueOrThrow({ where: { id: dto.schemeId } });
      prompt = buildApplicationLetterPrompt(
        entity as Record<string, unknown>,
        dto.entityType,
        scheme as Record<string, unknown>,
      );
      schemeId = dto.schemeId;
    } else if (dto.documentType === DocumentType.COMPLIANCE_ACTION_PLAN) {
      const latestBatch = await this.prisma.complianceCheckBatch.findFirst({
        where:
          dto.entityType === EntityType.BUSINESS
            ? { businessId: entityId }
            : { startupId: entityId },
        orderBy: { checkedAt: 'desc' },
        include: { results: { include: { complianceRequirement: true } } },
      });
      prompt = buildComplianceActionPlanPrompt(
        entity as Record<string, unknown>,
        dto.entityType,
        latestBatch?.results ?? [],
      );
    } else {
      const matchSummary = await this.buildMatchSummary(entityId, dto.entityType);
      prompt = buildProfileReportPrompt(
        entity as Record<string, unknown>,
        dto.entityType,
        matchSummary,
      );
    }

    const content = await this.ai.chat<{ sections: unknown[] }>(prompt);

    const document = await this.prisma.generatedDocument.create({
      data: {
        userId,
        ...(dto.entityType === EntityType.BUSINESS
          ? { businessId: entityId }
          : { startupId: entityId }),
        ...(schemeId ? { schemeId } : {}),
        documentType: dto.documentType,
        content: content as unknown as Prisma.InputJsonValue,
      },
    });

    return document;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.prisma.generatedDocument.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, documentType: true, schemeId: true, createdAt: true, pdfPath: true },
      }),
      this.prisma.generatedDocument.count({ where: { userId } }),
    ]);
    return { documents, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.generatedDocument.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async saveFilled(userId: string, id: string, filledContent: unknown) {
    const doc = await this.findOne(userId, id);
    return this.prisma.generatedDocument.update({
      where: { id: doc.id },
      data: { filledContent: filledContent as never },
    });
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

  private async buildMatchSummary(entityId: string, entityType: EntityType) {
    const where =
      entityType === EntityType.BUSINESS ? { businessId: entityId } : { startupId: entityId };
    const matches = await this.prisma.schemeMatch.findMany({
      where,
      include: { scheme: { select: { schemeName: true } } },
      orderBy: { matchScore: 'desc' },
      take: 50,
    });
    const eligible = matches.filter((m) => m.status === 'ELIGIBLE');
    return {
      total: matches.length,
      eligible: eligible.length,
      topSchemes: eligible.slice(0, 5).map((m) => m.scheme.schemeName),
    };
  }
}
