import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { CommandBus } from '@nestjs/cqrs';
import { SyncTmdbCommand } from './application/commands/sync/sync-tmdb/sync-tmdb.command';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('KIB Movies API')
    .setDescription('Movie listing, genres, ratings, favorites')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getInstance();

  server.get('/api/openapi.json', (_req: any, res: any) => res.json(document));

  server.use(
    '/api/reference',
    apiReference({ spec: { url: '/api/openapi.json' } }),
  );
  await app.init();
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  const auto = (process.env.AUTO_SYNC_ON_BOOT ?? '1').toLowerCase();
  if (auto === '1' || auto === 'true') {
    const pages = Number(process.env.SYNC_MOVIE_PAGES ?? 1);
    const bus = app.get(CommandBus);
    try {
      await bus.execute(new SyncTmdbCommand(pages));
    } catch (err) {
      console.log(err);
    }
  }

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);

  const url = await app.getUrl();
  console.log(`Scalar  : ${url}/api/reference`);
}
bootstrap();
