import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RenderPdfDto {
  @ApiProperty({ description: 'Filled document content with sections array' })
  @IsObject()
  content: { sections: { title: string; content: string }[] };
}

@ApiTags('pdf')
@ApiBearerAuth('JWT')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('render')
  @ApiOperation({ summary: 'Render filled document content to downloadable PDF' })
  async render(@Body() dto: RenderPdfDto, @Res() res: Response) {
    const buffer = await this.pdfService.render(dto.content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="vyaparsetu-document.pdf"');
    res.send(buffer);
  }
}
