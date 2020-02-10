import { DocumentReference } from '@google-cloud/firestore';

export interface StudentWrapper {
    ref: DocumentReference,
    matricula: string,
    password: string
}
