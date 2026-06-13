import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SchemesService } from './schemes.service';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { FilterSchemesDto } from './dto/filter-schemes.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('schemes')
@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Browse scheme catalogue (public)' })
  findAll(@Query() filter: FilterSchemesDto) {
    return this.schemesService.findAll(filter);
  }

  @Public()
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get scheme details by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.schemesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create scheme record (admin only)' })
  create(@Body() dto: CreateSchemeDto) {
    return this.schemesService.create(dto);
  }
}
