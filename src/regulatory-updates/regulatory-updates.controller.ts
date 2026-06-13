import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegulatoryUpdatesService } from './regulatory-updates.service';
import { FilterRegulatoryUpdatesDto } from './dto/filter-regulatory-updates.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('regulatory-updates')
@Controller('regulatory-updates')
export class RegulatoryUpdatesController {
  constructor(private readonly regulatoryUpdatesService: RegulatoryUpdatesService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get regulatory updates (public, cached 5 min)' })
  findAll(@Query() filter: FilterRegulatoryUpdatesDto) {
    return this.regulatoryUpdatesService.findAll(filter);
  }
}
