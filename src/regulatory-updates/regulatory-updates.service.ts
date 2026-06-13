import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterRegulatoryUpdatesDto } from './dto/filter-regulatory-updates.dto';

@Injectable()
export class RegulatoryUpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: FilterRegulatoryUpdatesDto) {
    const { severity, afterDate, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (severity) where.severity = severity;
    if (afterDate) where.effectiveDate = { gte: new Date(afterDate) };

    const [updates, total] = await Promise.all([
      this.prisma.regulatoryUpdate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ severity: 'desc' }, { effectiveDate: 'desc' }],
      }),
      this.prisma.regulatoryUpdate.count({ where }),
    ]);

    return { updates, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }
}
