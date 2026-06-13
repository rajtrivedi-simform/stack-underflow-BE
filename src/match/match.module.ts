import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { SchemesModule } from '../schemes/schemes.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { StartupsModule } from '../startups/startups.module';

@Module({
  imports: [SchemesModule, BusinessesModule, StartupsModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
