"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const admin = require("firebase-admin");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const schedule_interface_1 = require("../restaurant/inferfaces/schedule.interface");
const routine_wrapper_interface_1 = require("../shared/routine-wrapper.interface");
const student_wrapper_interface_1 = require("../shared/student-wrapper.interface");
const student_interface_1 = require("../shared/student.interface");
const util_service_1 = require("../shared/util/util.service");
let DatabaseService = class DatabaseService {
    constructor(configService, utilService) {
        this.configService = configService;
        this.utilService = utilService;
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(configService.get('SERVICE_ACCOUNT_KEY'))),
            databaseURL: "https://ufsmbot.firebaseio.com",
        });
        this.firestore = admin.firestore();
    }
    getStudentByCredentials(matricula, password) {
        const encryptedPassword = this.encrypt(password);
        return rxjs_1.defer(() => this.firestore.collection('estudantes')
            .where('matricula', '==', matricula)
            .limit(1)
            .get()).pipe(operators_1.switchMap(async (querySnapshot) => {
            if (querySnapshot.empty) {
                return this.firestore.collection('estudantes').add({
                    matricula,
                    password: encryptedPassword,
                    lastSchedule: null,
                    lastHistoryCheck: null,
                    isFriend: false
                });
            }
            const studentData = querySnapshot.docs[0].data();
            if (studentData.password !== password) {
                await querySnapshot.docs[0].ref.update({ password: encryptedPassword });
            }
            return querySnapshot.docs[0].ref;
        }));
    }
    getStudentByMatricula(matricula) {
        return rxjs_1.defer(() => this.firestore.collection('estudantes')
            .where('matricula', '==', matricula)
            .limit(1)
            .get()).pipe(operators_1.switchMap(querySnapshot => {
            const studentData = querySnapshot.docs[0].data();
            const studentWrap = {
                matricula,
                password: this.decrypt(studentData.password),
                ref: querySnapshot.docs[0].ref
            };
            return rxjs_1.of(studentWrap);
        }));
    }
    getStudentsToSchedule(limit, offset = 0) {
        const studentsToSchedule = [];
        const today = new Date();
        return rxjs_1.from(this.firestore.collection('estudantes')
            .where('lastSchedule', '==', null)
            .where('isFriend', '==', true)
            .limit(limit)
            .offset(offset)
            .get()).pipe(operators_1.mergeMap(querySnapshot => {
            querySnapshot.forEach((doc) => {
                const student = doc.data();
                studentsToSchedule.push({
                    ref: doc.ref,
                    matricula: student.matricula,
                    password: this.decrypt(student.password)
                });
            });
            return rxjs_1.from(this.firestore.collection('estudantes')
                .where('lastSchedule', '<', this.utilService.addDays(3, today))
                .where('isFriend', '==', true)
                .limit(limit)
                .offset(offset)
                .get());
        }), operators_1.mergeMap(querySnapshot => {
            querySnapshot.forEach((doc) => {
                const student = doc.data();
                studentsToSchedule.push({
                    ref: doc.ref,
                    matricula: student.matricula,
                    password: this.decrypt(student.password)
                });
            });
            return rxjs_1.of(studentsToSchedule);
        }));
    }
    getStudentRoutines(studentRef) {
        return rxjs_1.from(studentRef.collection('rotinas').get()).pipe(operators_1.map(querySnapshot => {
            const routines = [];
            querySnapshot.forEach((doc) => {
                const routine = Object.assign({}, doc.data());
                routine.ref = doc.ref;
                routines.push(routine);
            });
            return routines;
        }));
    }
    updateLastSchedule(lastSchedule, studentRef) {
        studentRef.update({ lastSchedule });
    }
    async saveError(student, schedule) {
        delete schedule.session;
        delete schedule.status;
        schedule.password = this.encrypt(schedule.password);
        try {
            await this.firestore.collection('errors').add({
                resolved: false,
                estudante: student.path,
                schedule
            });
            console.log(`Erro salvo - ${schedule.matricula}`);
        }
        catch (e) {
            console.log(`Erro ao salvar o erro - ${schedule.matricula}: ${e}`);
        }
    }
    encrypt(text) {
        const cryptoKey = crypto.createCipher('aes-128-cbc', process.env.CRYPTOKEY);
        let encrypted = cryptoKey.update(text, 'utf8', 'hex');
        encrypted += cryptoKey.final('hex');
        return encrypted;
    }
    decrypt(encripted) {
        const decryptKey = crypto.createDecipher('aes-128-cbc', process.env.CRYPTOKEY);
        let decrypted = decryptKey.update(encripted, 'hex', 'utf8');
        decrypted += decryptKey.final('utf8');
        return decrypted;
    }
};
DatabaseService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService, util_service_1.UtilService])
], DatabaseService);
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map