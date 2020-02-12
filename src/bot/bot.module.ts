import { Module } from '@nestjs/common';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { UtilService } from 'src/shared/util/util.service';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
    imports: [RestaurantModule, BotModule],
    providers: [RestaurantService, UtilService, BotService],
    exports: [UtilService],
    controllers: [BotController]
})
export class BotModule {}
