import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { StartupFundingQueryDto } from './dto/startup-funding-query.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Public()
  @Get('startup-funding')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Startup funding analytics from Kaggle dataset (public, cached 5 min)' })
  getStartupFunding(@Query() query: StartupFundingQueryDto) {
    return this.insightsService.getStartupFunding(query);
  }
}
