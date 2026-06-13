import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SOFT_DELETE_MODELS = [
  'user',
  'business',
  'startup',
  'schemeMatch',
  'generatedDocument',
] as const;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });

    this.$use(async (params, next) => {
      if (!params.model) return next(params);
      const model = params.model.charAt(0).toLowerCase() + params.model.slice(1);

      if (!SOFT_DELETE_MODELS.includes(model as (typeof SOFT_DELETE_MODELS)[number])) {
        return next(params);
      }

      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        params.args.where = { ...params.args.where, deletedAt: null };
      }

      if (params.action === 'findMany') {
        params.args ??= {};
        params.args.where = { ...params.args.where, deletedAt: null };
      }

      if (params.action === 'count') {
        params.args ??= {};
        params.args.where = { ...params.args.where, deletedAt: null };
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
