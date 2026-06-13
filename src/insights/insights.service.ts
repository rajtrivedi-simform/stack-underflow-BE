import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartupFundingQueryDto } from './dto/startup-funding-query.dto';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStartupFunding(query: StartupFundingQueryDto) {
    const { sector, state, fundingRound, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (sector) where.sector = { contains: sector, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (fundingRound) where.fundingRound = { contains: fundingRound, mode: 'insensitive' };

    const [records, total] = await Promise.all([
      this.prisma.startupFundingRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fundingDate: 'desc' },
      }),
      this.prisma.startupFundingRecord.count({ where }),
    ]);

    const aggregates = await this.prisma.startupFundingRecord.groupBy({
      by: ['sector'],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    return {
      records,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      topSectorsByFunding: aggregates,
    };
  }
}
