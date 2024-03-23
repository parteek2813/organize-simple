import '../utils/env';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ParsersModule } from './parsers/parsers.module';
import configuration from './config/configuration';
import { OrganizedDataModule } from './organized-data/organized-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 20,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configservice: ConfigService) => ({
        type: 'postgres',
        host: configservice.get('postgres.host'),
        port: configservice.get('postgres.port'),
        username: configservice.get('postgres.user'),
        password: configservice.get('postgres.password'),
        database: configservice.get('postgres.database'),
        autoLoadEntities: true,
        synchronize: configservice.get('nodeEnv') !== 'production',
      }),
    }),
    AuthModule,
    ParsersModule,
    OrganizedDataModule,
  ],
})
export class AppModule {}
