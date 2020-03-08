"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("../database/database.module");
const restaurant_module_1 = require("../restaurant/restaurant.module");
const util_service_1 = require("../shared/util/util.service");
const bot_controller_1 = require("./bot.controller");
const bot_service_1 = require("./bot.service");
let BotModule = class BotModule {
};
BotModule = __decorate([
    common_1.Module({
        imports: [config_1.ConfigModule.forRoot(), restaurant_module_1.RestaurantModule, database_module_1.DatabaseModule],
        providers: [util_service_1.UtilService, bot_service_1.BotService],
        exports: [bot_service_1.BotService],
        controllers: [bot_controller_1.BotController]
    })
], BotModule);
exports.BotModule = BotModule;
//# sourceMappingURL=bot.module.js.map