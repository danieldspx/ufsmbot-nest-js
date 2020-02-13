export interface Schedule {
    dia?: string,
    restaurante: number,
    refeicao: number | number[],
    matricula: string,
    password: string,
    session?: string,
    status?: ScheduleStatuses
}

export enum ScheduleStatuses {
    SCHEDULING,
    ERROR,
    SUCCESS
}
