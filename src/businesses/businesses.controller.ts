import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('businesses')
@ApiBearerAuth('JWT')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create business profile' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my business profile' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.businessesService.findByUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my business profile' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete business profile' })
  deleteMe(@CurrentUser('sub') userId: string) {
    return this.businessesService.softDelete(userId);
  }
}
