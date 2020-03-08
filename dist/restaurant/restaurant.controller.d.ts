import { DatabaseService } from 'src/database/database.service';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private readonly restaurantService;
    private readonly dbService;
    private readonly tesseractService;
    constructor(restaurantService: RestaurantService, dbService: DatabaseService, tesseractService: TesseractService);
}
