import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ToolService } from './tool.service';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolListResponseDto } from './dto/tool-list-response.dto';
import { ToolDetailDto } from './dto/tool-detail.dto';
import { ValidationErrorResponseDto } from '@shared/dto/validation-error-response.dto';
import { ErrorResponseDto } from '@shared/dto/error-response.dto';
import { PositiveIntPipe } from '@app/pipes/positive-int.pipe';

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get tool detail',
    description:
      'Returns full details for a single tool, including computed total monthly cost and 30-day usage metrics.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 5,
    description: 'Tool ID (positive integer)',
  })
  @ApiOkResponse({
    description: 'Tool detail with usage metrics.',
    type: ToolDetailDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (id is not a positive integer).',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Tool not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
    type: ErrorResponseDto,
  })
  findOne(
    @Param('id', PositiveIntPipe) id: number,
  ): Promise<ToolDetailDto> {
    return this.toolService.findOne(id);
  }
}
