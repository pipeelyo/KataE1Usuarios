import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({ origin: true, credentials: true });

  const swagger = new DocumentBuilder()
    .setTitle("KataE1 Usuarios")
    .setDescription("API del back de usuarios. Login Firebase, cache Redis, resiliencia RabbitMQ.")
    .setVersion("1")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swagger), {
    useGlobalPrefix: true,
  });

  await app.listen(process.env.PORT || 3000, "0.0.0.0");
}
bootstrap();
