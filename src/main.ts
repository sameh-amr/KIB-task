import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandBus } from '@nestjs/cqrs';
import { SyncTmdbCommand } from './application/commands/sync/sync-tmdb/sync-tmdb.command';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  const config = new DocumentBuilder()
    .setTitle('KIB Movies API')
    .setDescription('Movie listing, genres, ratings, and favorites')
    .setVersion('1.0.0')
    .addTag('movies')
    .addTag('genres')
    .addTag('favorites')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  
  const auto = (process.env.AUTO_SYNC_ON_BOOT ?? '1').toLowerCase();
  if (auto === '1' || auto === 'true') {
    const pages = Number(process.env.SYNC_MOVIE_PAGES ?? 1);
    const bus = app.get(CommandBus);
    try {
      await bus.execute(new SyncTmdbCommand(pages));
    } catch (err) {}
  }
  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);
}
bootstrap();
