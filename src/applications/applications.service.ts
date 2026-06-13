import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { EntityType } from '../match/dto/match-request.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const entityId = await this.resolveEntityId(userId, dto.entityType);
    return this.prisma.application.create({
      data: {
        ...(dto.entityType === EntityType.BUSINESS ? { businessId: entityId } : { startupId: entityId }),
        schemeId: dto.schemeId,
        portalName: dto.portalName ?? null,
        applicationStatus: 'DRAFT',
        formDataSnapshot: (dto.formDataSnapshot ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(userId: string, entityType: EntityType, page = 1, limit = 20) {
    const entityId = await this.resolveEntityId(userId, entityType);
    const where =
      entityType === EntityType.BUSINESS ? { businessId: entityId } : { startupId: entityId };
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { scheme: { select: { schemeName: true, applicationLink: true } } },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { applications, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    const data: Record<string, unknown> = { ...dto };
    if (dto.applicationStatus === 'SUBMITTED') data.submittedAt = new Date();

    return this.prisma.application.update({ where: { id }, data });
  }

  private async resolveEntityId(userId: string, entityType: EntityType): Promise<string> {
    if (entityType === EntityType.BUSINESS) {
      const b = await this.prisma.business.findUnique({ where: { userId } });
      if (!b) throw new NotFoundException('Business profile not found');
      return b.id;
    } else {
      const s = await this.prisma.startup.findUnique({ where: { userId } });
      if (!s) throw new NotFoundException('Startup profile not found');
      return s.id;
    }
  }
}
