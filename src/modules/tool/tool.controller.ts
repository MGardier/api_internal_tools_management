import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
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
import { QueryToolsRequestDto } from './dto/requests/query-tools.dto';
import { ToolListResponseDto } from './dto/responses/tool-list.dto';
import { ToolDetailResponseDto } from './dto/responses/tool-detail.dto';
import { ValidationErrorResponseDto } from '@shared/dto/responses/validation-error.dto';
import { ErrorResponseDto } from '@shared/dto/responses/error.dto';
import { PositiveIntPipe } from '@app/pipes/positive-int.pipe';
import { CreateToolRequestDto } from './dto/requests/create-tools.dto';

@ApiTags('tools')
@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) { }


  // =============================================================================
  //                               CREATE
  // =============================================================================


  @Post()

  create(
    @Body() dto : CreateToolRequestDto,
  ): Promise<any> {
    ;
  }


  // =============================================================================
  //                               FIND ALL
  // =============================================================================
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
  findAll(@Query() query: QueryToolsRequestDto): Promise<ToolListResponseDto> {
    return this.toolService.findAll(query);
  }




  // =============================================================================
  //                               FIND ONE 
  // =============================================================================

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
    type: ToolDetailResponseDto,
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
  ): Promise<ToolDetailResponseDto> {
    return this.toolService.findOne(id);
  }
}
