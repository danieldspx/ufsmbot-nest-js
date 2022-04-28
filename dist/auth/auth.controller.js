"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const restaurant_service_1 = require("../restaurant/restaurant.service");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService, restaurantService) {
        this.authService = authService;
        this.restaurantService = restaurantService;
    }
    login(body) {
        const { matricula, password } = body;
        return this.restaurantService.auth(matricula, password).pipe(operators_1.switchMap(session => this.restaurantService.getStudentNameAndCourse(matricula, session).pipe(operators_1.catchError(() => rxjs_1.of(undefined)))), operators_1.switchMap(studentInfo => this.authService.getCustomToken(matricula, password, studentInfo)));
    }
};
__decorate([
    common_1.Post('login'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        restaurant_service_1.RestaurantService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map