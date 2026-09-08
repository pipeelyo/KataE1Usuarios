import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Get("me")
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ description: "Claims del JWT de Firebase" })
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
        phone: typeof payload.phone_number === "string" ? payload.phone_number : undefined,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
