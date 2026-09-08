import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Controller("auth")
export class AuthController {
  @Get("me")
  async me(@Headers("authorization") auth?: string) {
    const token = auth?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException();
    const base = process.env.SUPABASE_URL;
    if (!base) throw new UnauthorizedException();
    try {
      const jwks = createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `${base}/auth/v1`,
      });
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
