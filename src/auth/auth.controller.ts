import { Body, Controller, Post } from '@nestjs/common';
import { mergeMap } from 'rxjs/operators';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly restaurantService: RestaurantService
    ){}

    @Post('login')
    login(@Body() body){
        return this.restaurantService.auth(body.matricula, body.password).pipe(
            mergeMap(() => this.authService.getCustomToken(body.matricula))
        );
    }
}
