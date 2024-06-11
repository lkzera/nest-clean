import { EnvService } from '@/infra/env/env.service';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(private readonly _envService: EnvService) {

    super({
      host: _envService.get('REDIS_HOST'),
      port: _envService.get('REDIS_PORT'),
      db: _envService.get('REDIS_DB'),
    });
  }
  onModuleDestroy() {
    return this.disconnect();
  }

}