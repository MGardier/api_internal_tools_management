import { Module } from '@nestjs/common';
import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';
import { ToolRepository } from './tool.repository';

@Module({
  controllers: [ToolController],
  providers: [ToolService, ToolRepository],
  exports: [ToolService],
})
export class ToolModule {}
