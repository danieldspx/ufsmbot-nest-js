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
const admin = require("firebase-admin");
const operators_1 = require("rxjs/operators");
const database_service_1 = require("../database/database.service");
const student_interface_1 = require("../shared/student.interface");
let AuthService = class AuthService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    getCustomToken(matricula, password, studentInfo) {
        return this.dbService.getStudentByCredentials(matricula, password)
            .pipe(operators_1.switchMap(async (studentRef) => {
            if (studentInfo && studentInfo.curso && studentInfo.nome) {
                await studentRef.update({ curso: studentInfo.curso, nome: studentInfo.nome });
            }
            return studentRef;
        }), operators_1.switchMap(studentRef => admin.auth().createCustomToken(studentRef.path, { matricula })), operators_1.map((token) => ({ token, message: 'sucess' })));
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map