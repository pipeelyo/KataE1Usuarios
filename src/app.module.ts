import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HealthController } from "./health.controller";
import { ResilienceController } from "./resilience.controller";

@Module({
  controllers: [HealthController, AuthController, ResilienceController],
})
export class AppModule {}
