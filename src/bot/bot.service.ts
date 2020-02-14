import { Injectable } from '@nestjs/common';
import { Moment } from 'moment';
import { concat, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, mergeMap, retryWhen } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';
import { Schedule, ScheduleStatuses } from 'src/restaurant/inferfaces/schedule.interface';
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
        let routines: RoutineWrapper[] = [];
        this.dbService.getStudentRoutines(student.ref)
            .pipe(
                mergeMap(routinesStudent => {
                    if (routinesStudent.length !== 0) {
                        routines = routinesStudent;
                        return this.restaurantService.auth(student.matricula, student.password)
                    } else {
                        return throwError('No routine found');
                    }
                }),
                mergeMap(session => {
                    let lastSchedule: Moment = moment();
                    const mealsScheduleGroup: Array<Observable<Schedule>> = [];
                    for (const routine of routines) {
                        const days = this.utilService.convertDaysToSchedule(routine.dias);
                        const lastDay = moment(_.last(days), 'DD/MM/YYYY');

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
                                session,
                                status: ScheduleStatuses.SCHEDULING
                            };

                            mealsScheduleGroup.push(
                                timer(0).pipe(// I could use the scheduleMeal here, but I dont want it to be called
                                    mergeMap( () =>
                                        this.restaurantService.scheduleTheMeal(schedule, student)
                                            .pipe(
                                                retryWhen(errors => {
                                                    let retries = 0;
                                                    return errors.pipe(
                                                        mergeMap(errMsg => {
                                                            if (++retries >= 3) {
                                                                return throwError('Retry limit exceeded. Error: ' + errMsg)
                                                            }
                                                            return errMsg;
                                                        }),
                                                        delay(500),
                                                    )
                                                }),
                                                catchError((err) => {
                                                    console.log(err);
                                                    schedule.status = ScheduleStatuses.ERROR;
                                                    return of(schedule)
                                                })
                                            )
                                    )
                                )
                            )
                        })
                    }
                    return concat(...mealsScheduleGroup);
                }),
            )
            .subscribe({
                next: schedule => {
                    if(schedule.status === ScheduleStatuses.ERROR){
                        console.log('Schedule Error', schedule.dia)
                    } else {
                        console.log('Schedle Sucess', schedule.dia)
                    }
                    this.restaurantService.logOut(schedule.session);
                },
                error: (err) => {
                    console.log(err)
                }
            })
    }
}
