import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({ description: "Proceso vivo. No depende de Redis ni RabbitMQ." })
  ok() {
    return { status: "ok" };
  }
}
