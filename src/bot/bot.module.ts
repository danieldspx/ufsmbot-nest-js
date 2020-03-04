import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { UtilService } from 'src/shared/util/util.service';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
    imports: [ConfigModule.forRoot(), RestaurantModule, DatabaseModule],
    providers: [UtilService, BotService],
    exports: [BotService],
    controllers: [BotController]
})
export class BotModule {}
