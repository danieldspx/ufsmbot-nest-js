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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const tesseract_service_1 = require("../tesseract/tesseract.service");
const restaurant_service_1 = require("./restaurant.service");
let RestaurantController = class RestaurantController {
    constructor(restaurantService, dbService, tesseractService) {
        this.restaurantService = restaurantService;
        this.dbService = dbService;
        this.tesseractService = tesseractService;
    }
};
RestaurantController = __decorate([
    common_1.Controller('restaurant'),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService,
        database_service_1.DatabaseService,
        tesseract_service_1.TesseractService])
], RestaurantController);
exports.RestaurantController = RestaurantController;
//# sourceMappingURL=restaurant.controller.js.map