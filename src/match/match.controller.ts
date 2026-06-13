import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchService } from './match.service';
import { MatchRequestDto, EntityType } from './dto/match-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class MatchHistoryQuery {
  @ApiPropertyOptional({ enum: EntityType, default: EntityType.BUSINESS })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsInt() @Min(1) limit?: number;
}

@ApiTags('match')
@ApiBearerAuth('JWT')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI scheme matching — profile resolved from DB via JWT' })
  match(@CurrentUser('sub') userId: string, @Body() dto: MatchRequestDto) {
    return this.matchService.match(userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get match history (paginated)' })
  history(@CurrentUser('sub') userId: string, @Query() query: MatchHistoryQuery) {
    return this.matchService.history(
      userId,
      query.entityType ?? EntityType.BUSINESS,
      query.page,
      query.limit,
    );
  }
}
