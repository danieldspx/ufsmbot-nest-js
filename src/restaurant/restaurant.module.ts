import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { RequestService } from './request/request.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RestaurantController],
  providers: [RestaurantService, RequestService, DatabaseService],
})
export class RestaurantModule {}
