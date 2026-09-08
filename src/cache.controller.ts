import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { RedisService } from "./redis.service";

@ApiTags("cache")
@Controller("cache")
export class CacheController {
  constructor(private readonly redis: RedisService) {}

  @Get(":key")
  @ApiOkResponse({ description: "Valor en Redis o null" })
  async get(@Param("key") key: string) {
    const value = await this.redis.get(key);
    return { key, value };
  }

  @Put(":key")
  @ApiOkResponse({ description: "Escribe en Redis usando el pool" })
  async set(@Param("key") key: string, @Body() body: { value?: string; ttlSec?: number }) {
    const value = body?.value ?? "";
    await this.redis.set(key, value, body?.ttlSec);
    return { key, value };
  }
}
