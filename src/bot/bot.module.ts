import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { RequestService } from 'src/restaurant/request/request.service';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { UtilService } from 'src/shared/util/util.service';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
    imports: [ConfigModule.forRoot(), RestaurantModule, DatabaseModule],
    providers: [RestaurantService, UtilService, BotService, RequestService],
    exports: [UtilService],
    controllers: [BotController]
})
export class BotModule {}
