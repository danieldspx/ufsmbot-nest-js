import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
    addDays(days: number, date: Date = new Date()): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}
