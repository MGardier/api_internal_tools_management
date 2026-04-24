import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { validateEnv } from '@app/config/env.validation';

import { PrismaModule } from '@db/prisma.module';
import { ToolModule } from '@modules/tool/tool.module';
import { CategoryModule } from '@modules/category/category.module';
import { AllExceptionsFilter } from '@app/filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    ToolModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
