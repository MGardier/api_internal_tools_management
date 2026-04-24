import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { EnvConfig } from '@app/config/env.schema';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService<EnvConfig, true>) {
    const showLog = configService.get('SHOW_SQL', { infer: true });
    super({
      log: showLog
        ? [
            { emit: 'stdout', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
