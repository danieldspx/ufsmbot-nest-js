import { Controller } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
    constructor(
        private readonly restaurantService: RestaurantService,
        private readonly dbService: DatabaseService,
        private readonly tesseractService: TesseractService
    ) {}
}
