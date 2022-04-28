import { Body, Controller, Post } from '@nestjs/common';
import { of } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
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
        const { matricula, password } = body;
        return this.restaurantService.auth(matricula, password).pipe(
            switchMap(session => this.restaurantService.getStudentNameAndCourse(matricula, session).pipe(catchError(() => of(undefined)))),
            switchMap(studentInfo => this.authService.getCustomToken(matricula, password, studentInfo))
        );
    }
}
