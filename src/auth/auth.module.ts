import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../database/entities/api-key.entity';
import { Application } from '../database/entities/application.entity';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([ApiKey, Application])],
  providers: [AuthService, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
