import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import 'dotenv/config';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createSchema } from 'zod-openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Learnify API')
    .setDescription('Learnify backend API')
    .setVersion('1.0')
    .addCookieAuth('__Host-sid')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      standardSchemaConverter: (schema, { schemaType }) => {
        const converted = createSchema(schema as never, {
          io: schemaType,
          openapiVersion: '3.0.0',
        });
        return { schema: converted.schema, components: converted.components };
      },
    });

  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
