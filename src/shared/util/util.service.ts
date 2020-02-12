import { Injectable } from '@nestjs/common';
import _ = require('lodash');
import moment = require('moment');

@Injectable()
export class UtilService {
    addDays(days: number, date: Date = new Date()): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    convertDaysToSchedule(days: number[] | number): string[] {
        const convertedDays: string[] = [];
        if (Array.isArray(days)) {
            const today = moment().day();
            const thisWeek = days.filter(day => day > today);
            const nextWeek = days.filter(day => day < today);
            for (const day of thisWeek) {
                convertedDays.push(
                    moment().day(day).format('DD/MM/YYYY')
                )
            }
            for (const day of nextWeek) {
                convertedDays.push(
                    moment().day(day + 7).format('DD/MM/YYYY')
                )
            }
        } else {
            convertedDays.push(
                moment().day(days).format('DD/MM/YYYY')
            );
        }
        return this.removeUnecessaryDates(this.sortDates(convertedDays));
    }

    sortDates(dates: string[]) {
        return _.orderBy(dates, date => moment(date, 'DD/MM/YYYY').format('YYYYMMDD'), ['asc']);
    }

    removeUnecessaryDates(dates: string[]): string[] {
        return dates.filter((dia: string) => {
            return moment(dia, 'DD/MM/YYYY')
                .isBefore(
                    moment().add(5, 'days')
                )
        })
    }
}
