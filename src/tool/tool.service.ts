import { Injectable } from '@nestjs/common';
import { ToolRepository } from './tool.repository';

@Injectable()
export class ToolService {
  constructor(private readonly toolRepository: ToolRepository) {}
}
