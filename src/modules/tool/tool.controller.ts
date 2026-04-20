import { Controller, Get, Query } from '@nestjs/common';
import { ToolService } from './tool.service';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolListResponseDto } from './dto/tool-list-response.dto';

@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Get()
  findAll(@Query() query: QueryToolsDto): Promise<ToolListResponseDto> {
    return this.toolService.findAll(query);
  }
}
