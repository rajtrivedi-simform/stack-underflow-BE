import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url', 'redis://localhost:6379');
        const ttlSeconds = config.get<number>('redis.ttlSeconds', 300);
        const parsed = new URL(redisUrl);
        const store = await redisStore({
          host: parsed.hostname,
          port: parseInt(parsed.port, 10) || 6379,
          ...(parsed.password ? { password: parsed.password } : {}),
          ttl: ttlSeconds * 1000,
        });
        return { store };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {}
