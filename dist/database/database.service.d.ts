import { DocumentReference } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Schedule } from 'src/restaurant/inferfaces/schedule.interface';
import { RoutineWrapper } from 'src/shared/routine-wrapper.interface';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { UtilService } from 'src/shared/util/util.service';
export declare class DatabaseService {
    private readonly configService;
    private readonly utilService;
    firestore: FirebaseFirestore.Firestore;
    constructor(configService: ConfigService, utilService: UtilService);
    getStudentByCredentials(matricula: string, password: string): Observable<DocumentReference>;
    getStudentByMatricula(matricula: string): Observable<StudentWrapper>;
    getStudentsToSchedule(limit: number, offset?: number): Observable<StudentWrapper[]>;
    getStudentRoutines(studentRef: DocumentReference): Observable<RoutineWrapper[]>;
    updateLastSchedule(lastSchedule: Date, studentRef: DocumentReference): void;
    saveError(student: DocumentReference, schedule: Schedule): Promise<void>;
    encrypt(text: string): string;
    decrypt(encripted: string): string;
}
