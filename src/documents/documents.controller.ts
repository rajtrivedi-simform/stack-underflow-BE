import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class PaginationQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsInt() @Min(1) limit?: number;
}

@ApiTags('documents')
@ApiBearerAuth('JWT')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI document (APPLICATION_LETTER | COMPLIANCE_ACTION_PLAN | PROFILE_REPORT)' })
  generate(@CurrentUser('sub') userId: string, @Body() dto: GenerateDocumentDto) {
    return this.documentsService.generate(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my generated documents' })
  findAll(@CurrentUser('sub') userId: string, @Query() query: PaginationQuery) {
    return this.documentsService.findAll(userId, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document content by ID' })
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.documentsService.findOne(userId, id);
  }

  @Patch(':id/fill')
  @ApiOperation({ summary: 'Save user-filled content (before PDF render)' })
  saveFilled(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() filledContent: unknown,
  ) {
    return this.documentsService.saveFilled(userId, id, filledContent);
  }
}
