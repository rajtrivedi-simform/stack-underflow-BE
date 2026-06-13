import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { IdeasService } from './ideas.service';
import { GenerateIdeasDto } from './dto/generate-ideas.dto';

@ApiTags('ideas')
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Generate AI-powered business ideas based on locality, budget, and optional scheme' })
  generate(@Body() dto: GenerateIdeasDto) {
    return this.ideasService.generate(dto);
  }
}
