import { Module } from '@nestjs/common';
import { RegulatoryUpdatesController } from './regulatory-updates.controller';
import { RegulatoryUpdatesService } from './regulatory-updates.service';

@Module({
  controllers: [RegulatoryUpdatesController],
  providers: [RegulatoryUpdatesService],
})
export class RegulatoryUpdatesModule {}
