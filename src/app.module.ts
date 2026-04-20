import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './app/config/env.validation';
import { PrismaModule } from 'prisma/prisma.module';
import { ToolModule } from './tool/tool.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    ToolModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
