import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import * as net from "net";
import { CircuitBreaker } from "./circuit-breaker";
import { RedisService } from "./redis.service";

const rabbitBreaker = new CircuitBreaker("rabbitmq", 3, 10_000);

function rabbitTarget() {
  const raw = process.env.RABBITMQ_URL || "amqp://kata:kata@localhost:5672";
  const u = new URL(raw.replace(/^amqp/i, "http"));
  return { host: u.hostname, port: Number(u.port || 5672) };
}

function pingRabbit(timeoutMs = 1500) {
  const { host, port } = rabbitTarget();
  return new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("rabbit-timeout"));
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.end();
      resolve();
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

@ApiTags("resilience")
@Controller("resilience")
export class ResilienceController {
  constructor(private readonly redis: RedisService) {}

  @Get()
  @ApiOkResponse({ description: "RabbitMQ circuit breaker + ping al pool Redis" })
  async status() {
    let rabbit: "up" | "down" | "circuit-open" = "down";
    try {
      await rabbitBreaker.exec(() => pingRabbit());
      rabbit = "up";
    } catch (e) {
      rabbit = e instanceof Error && e.message.startsWith("circuit-open") ? "circuit-open" : "down";
    }

    let redis: "up" | "down" = "down";
    try {
      await this.redis.ping();
      redis = "up";
    } catch {
      redis = "down";
    }

    const ok = rabbit === "up" && redis === "up";
    return {
      status: ok ? "ok" : "degraded",
      rabbit,
      redis,
      redisPoolSize: this.redis.size(),
      circuit: rabbitBreaker.snapshot(),
    };
  }
}
