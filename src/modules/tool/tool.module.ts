import { Module } from '@nestjs/common';
import { ToolController } from './tool.controller';
import { ToolService } from './tool.service';
import { ToolRepository } from './tool.repository';
import { CategoryModule } from '@modules/category/category.module';

@Module({
  imports: [CategoryModule],
  controllers: [ToolController],
  providers: [ToolService, ToolRepository],
  exports: [ToolService],
})
export class ToolModule {}
