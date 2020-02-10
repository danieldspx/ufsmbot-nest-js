import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService, private readonly dbService: DatabaseService) {}

    @Get('auth')
    auth() {
        this.dbService.getStudentByMatricula('201910481', '99147465').subscribe(x => console.log(x))
        // this.restaurantService.auth().subscribe(next => {console.log(next)}, err => {console.log(err)});
    }
}
