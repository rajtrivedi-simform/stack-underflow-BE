import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly ttlDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {
    this.ttlDays = this.config.get<number>('data.profileTtlDays', 90);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredProfiles() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.ttlDays);

    const [users, businesses, startups, documents] = await Promise.all([
      this.prisma.user.deleteMany({ where: { deletedAt: { lte: cutoff } } }),
      this.prisma.business.deleteMany({ where: { deletedAt: { lte: cutoff } } }),
      this.prisma.startup.deleteMany({ where: { deletedAt: { lte: cutoff } } }),
      this.prisma.generatedDocument.deleteMany({ where: { deletedAt: { lte: cutoff } } }),
    ]);

    this.logger.log?.(
      `TTL cleanup: ${users.count} users, ${businesses.count} businesses, ${startups.count} startups, ${documents.count} documents purged`,
      'CleanupService',
    );
  }
}
