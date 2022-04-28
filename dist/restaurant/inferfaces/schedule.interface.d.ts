export interface Schedule {
    dia?: string;
    restaurante: number;
    refeicao: number | number[];
    matricula: string;
    password: string;
    session?: string;
    status?: ScheduleStatuses;
}
export declare enum ScheduleStatuses {
    SCHEDULING = 0,
    ERROR = 1,
    SUCCESS = 2,
    CANNOT_SCHEDULE = 3
}
