import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { ApplicationModule } from './application/application.module';
import { InterfaceModule } from './interface/interface.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT ?? 5432),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: false, 
      }),
    }),
    PersistenceModule,
    ApplicationModule,
    InterfaceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
