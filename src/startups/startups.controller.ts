import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartupsService } from './startups.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('startups')
@ApiBearerAuth('JWT')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create startup profile' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateStartupDto) {
    return this.startupsService.create(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my startup profile' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.startupsService.findByUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my startup profile' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateStartupDto) {
    return this.startupsService.update(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete startup profile' })
  deleteMe(@CurrentUser('sub') userId: string) {
    return this.startupsService.softDelete(userId);
  }
}
