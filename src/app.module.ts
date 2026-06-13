import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import configuration from './config/configuration';
import { configValidationSchema } from './config/config.schema';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { StartupsModule } from './startups/startups.module';
import { SchemesModule } from './schemes/schemes.module';
import { MatchModule } from './match/match.module';
import { ComplianceModule } from './compliance/compliance.module';
import { DocumentsModule } from './documents/documents.module';
import { PdfModule } from './pdf/pdf.module';
import { ApplicationsModule } from './applications/applications.module';
import { RegulatoryUpdatesModule } from './regulatory-updates/regulatory-updates.module';
import { InsightsModule } from './insights/insights.module';
import { IdeasModule } from './ideas/ideas.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    TerminusModule,
    LoggerModule,
    PrismaModule,
    RedisModule,
    AiModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    StartupsModule,
    SchemesModule,
    MatchModule,
    ComplianceModule,
    DocumentsModule,
    PdfModule,
    ApplicationsModule,
    RegulatoryUpdatesModule,
    InsightsModule,
    IdeasModule,
    CleanupModule,
    HealthModule,
  ],
})
export class AppModule {}
