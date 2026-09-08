import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { CacheController } from "./cache.controller";
import { HealthController } from "./health.controller";
import { RedisService } from "./redis.service";
import { ResilienceController } from "./resilience.controller";

@Module({
  controllers: [HealthController, AuthController, ResilienceController, CacheController],
  providers: [RedisService],
})
export class AppModule {}
