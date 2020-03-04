import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { map } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly dbService: DatabaseService
    ){}

    getCustomToken(matricula){
        return this.dbService.getStudentByMatricula(matricula)
        .pipe(
            map(student => student.ref.path),
            map((refPath) => admin.auth().createCustomToken(refPath, {matricula})),
            map((token) => ({token, message: 'sucess'}))
        )
    }
}
