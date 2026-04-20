import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ToolService } from './tool.service';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolListResponseDto } from './dto/tool-list-response.dto';
import { ValidationErrorResponseDto } from '@shared/dto/validation-error-response.dto';
import { ErrorResponseDto } from '@shared/dto/error-response.dto';

@ApiTags('tools')
@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) { }

  @Get()
  @ApiOperation({
    summary: 'List tools',
    description:
      'Returns a paginated and filterable list of tools, with aggregate counts and the filters applied.',
  })
  @ApiOkResponse({
    description: 'Paginated list of tools matching the query.',
    type: ToolListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (invalid query parameters).',
    type: ValidationErrorResponseDto,
  })

  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
    type: ErrorResponseDto,
  })
  findAll(@Query() query: QueryToolsDto): Promise<ToolListResponseDto> {
    return this.toolService.findAll(query);
  }
}
