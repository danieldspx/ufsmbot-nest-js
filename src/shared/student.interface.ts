export interface Student {
    matricula?: string;
    password?: string;
    lastSchedule?: Date;
    lastHistoryCheck?: Date;
    banCount?: number;
    banUntil?: Date;
    isFirstLogin?: boolean;
    agreementAccepted?: boolean;
    email?: string;
    nome?: string;
    curso?: string;
}
