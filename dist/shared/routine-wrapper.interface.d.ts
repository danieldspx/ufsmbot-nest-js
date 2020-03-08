import { DocumentReference } from '@google-cloud/firestore';
export interface RoutineWrapper {
    ref: DocumentReference;
    tiposRefeicao: number[];
    dias: number[];
    restaurante: number;
}
