import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { ComplianceRequestDto } from './dto/compliance-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EntityType } from '../match/dto/match-request.dto';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class ComplianceHistoryQuery {
  @ApiPropertyOptional({ enum: EntityType, default: EntityType.BUSINESS })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsInt() @Min(1) limit?: number;
}

@ApiTags('compliance')
@ApiBearerAuth('JWT')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run AI compliance check — returns overallScore % + per-item GREEN/YELLOW/RED' })
  check(@CurrentUser('sub') userId: string, @Body() dto: ComplianceRequestDto) {
    return this.complianceService.check(userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'List past compliance checks (paginated)' })
  history(@CurrentUser('sub') userId: string, @Query() query: ComplianceHistoryQuery) {
    return this.complianceService.history(
      userId,
      query.entityType ?? EntityType.BUSINESS,
      query.page,
      query.limit,
    );
  }
}
