import { RestaurantService } from 'src/restaurant/restaurant.service';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly restaurantService;
    constructor(authService: AuthService, restaurantService: RestaurantService);
    login(body: any): import("rxjs").Observable<{
        token: string;
        message: string;
    }>;
}
