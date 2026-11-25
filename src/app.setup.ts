import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemDetailsFilter } from './interfaces/http/filters/problem-details.filter';

/**
 * HTTP configuration shared by main.ts and the e2e tests, so both run the
 * same validation, error format and OpenAPI document.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());

  const config = new DocumentBuilder()
    .setTitle('HexaBlock API')
    .setDescription(
      'Accounts, progress sync, leaderboards and level definitions for the HexaBlock Suite. Errors use application/problem+json (RFC 9457).',
    )
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs-json' });
}
