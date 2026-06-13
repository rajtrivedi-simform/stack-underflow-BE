import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EntityType } from '../match/dto/match-request.dto';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class ApplicationListQuery {
  @ApiPropertyOptional({ enum: EntityType, default: EntityType.BUSINESS })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsInt() @Min(1) limit?: number;
}

@ApiTags('applications')
@ApiBearerAuth('JWT')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Track a scheme application' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my applications' })
  findAll(@CurrentUser('sub') userId: string, @Query() query: ApplicationListQuery) {
    return this.applicationsService.findAll(
      userId,
      query.entityType ?? EntityType.BUSINESS,
      query.page,
      query.limit,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application status or form data' })
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(userId, id, dto);
  }
}
