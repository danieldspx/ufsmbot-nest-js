import { Injectable } from '@nestjs/common';
import { Moment } from 'moment';
import { concat, defer, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';
import { Schedule, ScheduleStatuses } from 'src/restaurant/inferfaces/schedule.interface';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { RoutineWrapper } from 'src/shared/routine-wrapper.interface';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { UtilService } from 'src/shared/util/util.service';
import moment = require('moment');
import _ = require('lodash');
import { Console } from 'console';
import { ScheduleException, ScheduleExceptionType } from 'src/shared/schedule.exception';

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
                        console.log('Will try to schedule', days)

                        _.pullAll(days, daysException); // Remove the days that are the exception

                        if (lastSchedule.isBefore(lastDay)) {
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
                                timer(0).pipe(// I could use the scheduleMeal here, but I dont want it to be called (defer does not work properly)
                                    mergeMap( () =>
                                        this.restaurantService.scheduleTheMeal(schedule, student)
                                            .pipe(
                                                retryWhen(errors => {
                                                    let retries = 0;
                                                    return errors.pipe(
                                                        mergeMap(err => {
                                                            if (
                                                                ++retries >= 6 ||
                                                                (typeof err === 'object'  && (err as ScheduleException).code === ScheduleExceptionType.NON_RETRIABLE)
                                                            ) {
                                                                console.error('Retry limit exceeded or cannot be retried. Error: ' + err);
                                                                return throwError(err)
                                                            }
                                                            return err;
                                                        }),
                                                        delay(500),
                                                    )
                                                }),
                                                catchError((err) => {
                                                    let status = ScheduleStatuses.ERROR;
                                                    if (typeof err === 'object' && (err as ScheduleException).code === ScheduleExceptionType.NON_RETRIABLE) {
                                                        status = ScheduleStatuses.CANNOT_SCHEDULE;
                                                    }
                                                    schedule.status = status;
                                                    return of(schedule)
                                                })
                                            )
                                    ),
                                    delay(500)
                                )
                            )
                        })
                    }
                    this.dbService.updateLastSchedule(lastSchedule.toDate(), student.ref);
                    return concat(...mealsScheduleGroup);
                }),
            )
            .subscribe({
                next: schedule => {
                    let logMessage = '[SCHEDULE_SUCCESS]';
                    if(schedule.status === ScheduleStatuses.ERROR) {
                        this.dbService.saveError(student.ref, schedule);
                        logMessage = '[SCHEDULE_ERROR]';
                    } else if (schedule.status === ScheduleStatuses.CANNOT_SCHEDULE) {
                        logMessage = '[CANNOT_SCHEDULE]';
                    }

                    console.log(`${logMessage} - Matricula: ${schedule.matricula} Schedule Attempt: ${schedule.dia}`);

                    this.restaurantService.logOut(schedule.session);
                },
                error: (err) => {
                    console.log(err)
                }
            })
    }
}
