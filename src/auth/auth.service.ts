import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';
import { Student } from 'src/shared/student.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly dbService: DatabaseService
    ){}

    getCustomToken(matricula: string, password: string, studentInfo?: { nome: string; curso: string; }){
        return this.dbService.getStudentByCredentials(matricula, password)
        .pipe(
            switchMap(async studentRef => {
                if (studentInfo && studentInfo.curso && studentInfo.nome) {
                    await studentRef.update({ curso: studentInfo.curso, nome: studentInfo.nome } as Student);
                }
                
                return studentRef;
            }),
            switchMap(studentRef => admin.auth().createCustomToken(studentRef.path, {matricula})),
            map((token) => ({token, message: 'sucess'}))
        )
    }
}
