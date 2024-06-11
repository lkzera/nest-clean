import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Injectable()
export class EnvService {
  constructor(private _configService: ConfigService<Env, true>) { }

  get<T extends keyof Env>(key: T) {
    return this._configService.get(key, { infer: true });
  }
}