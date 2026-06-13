import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { FilterSchemesDto } from './dto/filter-schemes.dto';

@Injectable()
export class SchemesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FilterSchemesDto) {
    const { state, level, targetCategory, sector, search, isActive = true, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.SchemeWhereInput = { isActive };

    if (level) where.level = level;
    if (targetCategory) where.targetCategory = targetCategory;
    if (search) where.schemeName = { contains: search, mode: 'insensitive' };

    if (state) {
      where.OR = [
        { applicableStates: { equals: Prisma.DbNull } },
        { applicableStates: { array_contains: [state] } as Prisma.JsonFilter },
        { applicableStates: { equals: [] } },
      ];
    }

    const [schemes, total] = await Promise.all([
      this.prisma.scheme.findMany({ where, skip, take: limit, orderBy: { schemeName: 'asc' } }),
      this.prisma.scheme.count({ where }),
    ]);

    return { schemes, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return this.prisma.scheme.findUniqueOrThrow({ where: { id } });
  }

  async create(dto: CreateSchemeDto) {
    return this.prisma.scheme.create({
      data: {
        ...dto,
        documents: dto.documents ?? [],
        schemeCategory: (dto.schemeCategory ?? {}) as Prisma.InputJsonValue,
        tags: dto.tags ?? [],
        applicableStates: dto.applicableStates ?? [],
      },
    });
  }

  async findManyForMatch(targetCategory?: string): Promise<Array<{ id: string; schemeName: string; eligibility: string | null; targetCategory: string | null; applicableStates: unknown }>> {
    return this.prisma.scheme.findMany({
      where: {
        isActive: true,
        ...(targetCategory ? { OR: [{ targetCategory }, { targetCategory: null }] } : {}),
      },
      select: {
        id: true,
        schemeName: true,
        eligibility: true,
        targetCategory: true,
        applicableStates: true,
        tags: true,
        level: true,
        benefits: true,
        applicationLink: true,
      },
    }) as Promise<Array<{ id: string; schemeName: string; eligibility: string | null; targetCategory: string | null; applicableStates: unknown }>>;
  }
}
