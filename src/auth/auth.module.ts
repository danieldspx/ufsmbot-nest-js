import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
