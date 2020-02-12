import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [RestaurantModule, ConfigModule.forRoot(), DatabaseModule, BotModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
