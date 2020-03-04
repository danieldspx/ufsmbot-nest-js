import { DocumentReference } from '@google-cloud/firestore';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { Schedule } from 'src/restaurant/inferfaces/schedule.interface';
import { RoutineWrapper } from 'src/shared/routine-wrapper.interface';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { Student } from 'src/shared/student.interface';
import { UtilService } from 'src/shared/util/util.service';

@Injectable({
    scope: Scope.DEFAULT
})
export class DatabaseService {
    firestore: FirebaseFirestore.Firestore;

    constructor(private readonly configService: ConfigService, private readonly utilService: UtilService) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(configService.get<string>('SERVICE_ACCOUNT_KEY'))),
            databaseURL: "https://ufsmbot.firebaseio.com",
        })
        this.firestore = admin.firestore();
    }

    getStudentByCredentials(matricula: string, password: string): Observable<DocumentReference> {
        const encryptedPassword = this.encrypt(password);
        return from(
            this.firestore.collection('estudantes')
                .where('matricula', '==', matricula)
                .limit(1)
                .get()
        ).pipe(
            mergeMap(querySnapshot => {
                if (querySnapshot.empty) {//User does not exist
                    return from(this.firestore.collection('estudantes').add({
                        matricula,
                        password: encryptedPassword,
                        lastSchedule: null,
                        lastHistoryCheck: null,
                    } as Student))
                }

                const studentData: Student = querySnapshot.docs[0].data() as Student;
                if (studentData.password !== password) {
                    querySnapshot.docs[0].ref.update({ password: encryptedPassword } as Student)
                }
                return of(querySnapshot.docs[0].ref)
            })
        )
    }

    getStudentByMatricula(matricula: string): Observable<StudentWrapper> {
        return from(
            this.firestore.collection('estudantes')
                .where('matricula', '==', matricula)
                .limit(1)
                .get()
        ).pipe(
            mergeMap(querySnapshot => {
                const studentData: Student = querySnapshot.docs[0].data() as Student;
                const studentWrap: StudentWrapper = {
                    matricula,
                    password: this.decrypt(studentData.password),
                    ref: querySnapshot.docs[0].ref
                }
                return of(studentWrap);
            }),
            take(1)
        )
    }

    getStudentsToSchedule(limit: number, offset: number = 0): Observable<StudentWrapper[]> {
        const studentsToSchedule: StudentWrapper[] = [];

        const today = new Date();

        return from(
            this.firestore.collection('estudantes')
                .where('lastSchedule', '==', null)
                .where('isFriend', '==', true)
                .limit(limit)
                .offset(offset)
                .get()
        ).pipe(
            mergeMap(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    const student = doc.data();
                    studentsToSchedule.push({
                        ref: doc.ref,
                        matricula: student.matricula,
                        password: this.decrypt(student.password)
                    });
                })

                return from(
                    this.firestore.collection('estudantes')
                        .where('lastSchedule', '<', this.utilService.addDays(3, today))
                        .where('isFriend', '==', true)
                        .limit(limit)
                        .offset(offset)
                        .get()
                )
            }),
            mergeMap(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    const student = doc.data();
                    studentsToSchedule.push({
                        ref: doc.ref,
                        matricula: student.matricula,
                        password: this.decrypt(student.password)
                    });
                })

                return of(studentsToSchedule);
            })
        )
    }

    getStudentRoutines(studentRef: DocumentReference): Observable<RoutineWrapper[]> {
        return from(studentRef.collection('rotinas').get()).pipe(
            map(querySnapshot => {
                const routines: RoutineWrapper[] = [];
                querySnapshot.forEach((doc) => {
                    const routine: RoutineWrapper = {
                        ...doc.data() as RoutineWrapper
                    };
                    routine.ref = doc.ref;
                    routines.push(routine as RoutineWrapper)
                })
                return routines;
            })
        )
    }

    async saveError(student: DocumentReference, schedule: Schedule) {
        delete schedule.session;
        delete schedule.status;

        schedule.password = this.encrypt(schedule.password);
        try {
            await this.firestore.collection('errors').add({
                resolved: false,
                estudante: student.path,
                schedule
            })

            console.log(`Erro salvo - ${schedule.matricula}`)
        } catch (e) {
            console.log(`Erro ao salvar o erro - ${schedule.matricula}: ${e}`);
        }
    }

    encrypt(text: string) {
        const cryptoKey = crypto.createCipher('aes-128-cbc', process.env.CRYPTOKEY);
        let encrypted = cryptoKey.update(text, 'utf8', 'hex');
        encrypted += cryptoKey.final('hex')
        return encrypted
    }

    decrypt(encripted: string) {
        const decryptKey = crypto.createDecipher('aes-128-cbc', process.env.CRYPTOKEY);
        let decrypted = decryptKey.update(encripted, 'hex', 'utf8');
        decrypted += decryptKey.final('utf8');
        return decrypted
    }
}
