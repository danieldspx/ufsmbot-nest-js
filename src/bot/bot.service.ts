import { Injectable } from '@nestjs/common';
import { Moment } from 'moment';
import { Observable, throwError } from 'rxjs';
import { concatAll, delay, mergeMap, retryWhen } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';
import { Schedule } from 'src/restaurant/inferfaces/schedule.interface';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { RoutineWrapper } from 'src/shared/routine-wrapper.interface';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { UtilService } from 'src/shared/util/util.service';
import { isUndefined } from 'util';
import moment = require('moment');
import _ = require('lodash');

@Injectable()
export class BotService {
    constructor(
        private readonly dbService: DatabaseService,
        private readonly restaurantService: RestaurantService,
        private readonly utilService: UtilService
    ) { }

    scheduleForStudent(matricula: string) {
        this.dbService.getStudentByMatricula(matricula).subscribe(student => this.prepareScheduleForStudent(student))
    }

    prepareScheduleForStudent(student: StudentWrapper, daysException: any[] = []) {
        console.log('PrepareScheduleForStudent');
        let routines: RoutineWrapper[] = [];
        this.dbService.getStudentRoutines(student.ref)
            .pipe(
                mergeMap(routinesStudent => {
                    if (routinesStudent.length !== 0) {
                        routines = routinesStudent;
                        return this.restaurantService.auth(student.matricula, student.password)
                    } else {
                        throw new Error('No routine found');
                    }
                }),
                mergeMap(session => {
                    let lastSchedule: Moment = moment();
                    const mealsScheduleGroup: Array<Observable<Schedule>> = [];
                    for (const routine of routines) {
                        const days = this.utilService.convertDaysToSchedule(routine.dias);
                        const lastDay = moment(_.last(days), 'DD/MM/YYYY');
                        let index = 1;

                        _.pullAll(days, daysException); // Remove the days that are the exception

                        if (isUndefined(lastSchedule)) {// This will problably never happen, but leave it there...just in case
                            lastSchedule = lastDay;
                        } else if (lastSchedule.isBefore(lastDay)) {
                            lastSchedule = lastDay;
                        }

                        days.forEach((day) => {
                            const schedule: Schedule = {
                                dia: day,
                                restaurante: routine.restaurante,
                                refeicao: routine.tiposRefeicao,
                                matricula: student.matricula,
                                password: student.password,
                                session
                            };

                            mealsScheduleGroup.push(
                                this.restaurantService.scheduleTheMeal(schedule, student).pipe(
                                    delay(500*index++),
                                    retryWhen(errors => {
                                        let retries = 0;
                                        return errors.pipe(
                                            mergeMap(errMsg => {
                                                if (++retries >= 3) {
                                                    return throwError('Retry limit exceeded. Error: ' + errMsg)
                                                }
                                                console.log(errMsg);
                                                return errMsg;
                                            }),
                                            delay(500),
                                        )
                                    })
                                )
                            )
                        })
                    }
                    return mealsScheduleGroup;
                }),
                concatAll()
            )
            .subscribe({
                next: schedule => {
                    console.log(schedule);
                },
                error: (err: Error) => {
                    console.log(err)
                }
            })
    }
}
