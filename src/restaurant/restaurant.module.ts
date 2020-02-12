import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { RequestService } from './request/request.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, RequestService, DatabaseService, TesseractService],
  exports: [ConfigModule.forRoot(), RequestService, DatabaseService, TesseractService]
})
export class RestaurantModule {}
