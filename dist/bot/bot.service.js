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
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const database_service_1 = require("../database/database.service");
const schedule_interface_1 = require("../restaurant/inferfaces/schedule.interface");
const restaurant_service_1 = require("../restaurant/restaurant.service");
const routine_wrapper_interface_1 = require("../shared/routine-wrapper.interface");
const student_wrapper_interface_1 = require("../shared/student-wrapper.interface");
const util_service_1 = require("../shared/util/util.service");
const moment = require("moment");
const _ = require("lodash");
let BotService = class BotService {
    constructor(dbService, restaurantService, utilService) {
        this.dbService = dbService;
        this.restaurantService = restaurantService;
        this.utilService = utilService;
    }
    scheduleForStudent(matricula) {
        this.dbService.getStudentByMatricula(matricula).subscribe(student => this.prepareScheduleForStudent(student));
    }
    prepareScheduleForStudent(student, daysException = []) {
        let routines = [];
        this.dbService.getStudentRoutines(student.ref)
            .pipe(operators_1.mergeMap(routinesStudent => {
            if (routinesStudent.length !== 0) {
                routines = routinesStudent;
                return this.restaurantService.auth(student.matricula, student.password);
            }
            else {
                return rxjs_1.throwError('No routine found');
            }
        }), operators_1.mergeMap(session => {
            let lastSchedule = moment();
            const mealsScheduleGroup = [];
            for (const routine of routines) {
                const days = this.utilService.convertDaysToSchedule(routine.dias);
                const lastDay = moment(_.last(days), 'DD/MM/YYYY');
                _.pullAll(days, daysException);
                if (lastSchedule.isBefore(lastDay)) {
                    lastSchedule = lastDay;
                }
                days.forEach((day) => {
                    const schedule = {
                        dia: day,
                        restaurante: routine.restaurante,
                        refeicao: routine.tiposRefeicao,
                        matricula: student.matricula,
                        password: student.password,
                        session,
                        status: schedule_interface_1.ScheduleStatuses.SCHEDULING
                    };
                    mealsScheduleGroup.push(rxjs_1.timer(0).pipe(operators_1.mergeMap(() => this.restaurantService.scheduleTheMeal(schedule, student)
                        .pipe(operators_1.retryWhen(errors => {
                        let retries = 0;
                        return errors.pipe(operators_1.mergeMap(errMsg => {
                            if (++retries >= 6) {
                                return rxjs_1.throwError('Retry limit exceeded. Error: ' + errMsg);
                            }
                            return errMsg;
                        }), operators_1.delay(500));
                    }), operators_1.catchError((err) => {
                        console.log(err);
                        schedule.status = schedule_interface_1.ScheduleStatuses.ERROR;
                        return rxjs_1.of(schedule);
                    }))), operators_1.delay(500)));
                });
            }
            this.dbService.updateLastSchedule(lastSchedule.toDate(), student.ref);
            return rxjs_1.concat(...mealsScheduleGroup);
        }))
            .subscribe({
            next: schedule => {
                if (schedule.status === schedule_interface_1.ScheduleStatuses.ERROR) {
                    this.dbService.saveError(student.ref, schedule);
                    console.log('Schedule Error', schedule.dia);
                }
                else {
                    console.log('Schedle Sucess', schedule.dia);
                }
                this.restaurantService.logOut(schedule.session);
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
};
BotService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        restaurant_service_1.RestaurantService,
        util_service_1.UtilService])
], BotService);
exports.BotService = BotService;
//# sourceMappingURL=bot.service.js.map