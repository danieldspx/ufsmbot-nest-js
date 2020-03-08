export declare class UtilService {
    addDays(days: number, date?: Date): Date;
    convertDaysToSchedule(days: number[] | number): string[];
    sortDates(dates: string[]): any;
    removeUnecessaryDates(dates: string[]): string[];
}
