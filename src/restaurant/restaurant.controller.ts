import { Controller, Get } from '@nestjs/common';
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

    @Get('auth')
    auth() {
        // this.dbService.getStudentByMatricula('201910481', '99147465').subscribe(x => console.log(x))
        // this.restaurantService.auth().subscribe(next => {console.log(next)}, err => {console.log(err)});
        this.tesseractService.recognizeCaptchaSchedule('230fd47a39ecc2ac22a77211e6fa');
    }
}
