import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AngularModule } from './angular/angular.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [RestaurantModule, ConfigModule.forRoot(), BotModule, AuthModule, AngularModule.forRoot({
      rootPath: 'dist/client-ng'
    })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
