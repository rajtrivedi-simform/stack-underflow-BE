import { Module } from '@nestjs/common';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { SchemesModule } from '../schemes/schemes.module';

@Module({
  imports: [SchemesModule],
  controllers: [IdeasController],
  providers: [IdeasService],
})
export class IdeasModule {}
