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
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const student_wrapper_interface_1 = require("../shared/student-wrapper.interface");
const bot_service_1 = require("./bot.service");
let BotController = class BotController {
    constructor(dbService, configService, botService) {
        this.dbService = dbService;
        this.configService = configService;
        this.botService = botService;
    }
    scheduleEveryone() {
        this.dbService.getStudentsToSchedule(parseInt(this.configService.get('LIMIT_USERS'), 10))
            .subscribe((students) => {
            for (const student of students) {
                this.botService.prepareScheduleForStudent(student);
            }
        });
    }
    scheduleForStudent(params) {
        return this.botService.scheduleForStudent(params.matricula);
    }
};
__decorate([
    common_1.Get('schedule'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BotController.prototype, "scheduleEveryone", null);
__decorate([
    common_1.Get('schedule/:matricula'),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BotController.prototype, "scheduleForStudent", null);
BotController = __decorate([
    common_1.Controller('bot'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService,
        bot_service_1.BotService])
], BotController);
exports.BotController = BotController;
//# sourceMappingURL=bot.controller.js.map