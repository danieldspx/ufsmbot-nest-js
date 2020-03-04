import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

    @Post('login')
    login(@Body() body){
        console.log(body)
        // return this.authService.getCustomToken(body.matricula)
    }
}
