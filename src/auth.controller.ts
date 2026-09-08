import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

@Controller("auth")
export class AuthController {
  @Get("me")
  async me(@Headers("authorization") auth?: string) {
    const token = auth?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException();
    const projectId = process.env.GCP_PROJECT_ID || "round-seeker-309101";
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      return {
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : undefined,
        picture: typeof payload.picture === "string" ? payload.picture : undefined,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
