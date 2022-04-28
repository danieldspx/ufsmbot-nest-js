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
const queryString = require("querystring");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const schedule_exception_1 = require("../shared/schedule.exception");
const student_wrapper_interface_1 = require("../shared/student-wrapper.interface");
const tesseract_service_1 = require("../tesseract/tesseract.service");
const request_service_1 = require("./request/request.service");
let RestaurantService = class RestaurantService {
    constructor(requestService, tesseractService) {
        this.requestService = requestService;
        this.tesseractService = tesseractService;
    }
    auth(matricula, password) {
        const data = {
            j_username: matricula,
            j_password: password,
        };
        const requestConfig = {
            body: queryString.stringify(data),
            referrer: 'https://portal.ufsm.br/ru/index.html',
            url: 'https://portal.ufsm.br/ru/j_security_check'
        };
        return this.requestService.makeRequest(requestConfig)
            .pipe(operators_1.mergeMap(response => {
            if (response.url.indexOf('jsessionid') === -1) {
                return rxjs_1.throwError(`Error on restaurant-auth for user ${data.j_username}`);
            }
            return rxjs_1.of(response.url.split(';')[1].replace('jsessionid=', ''));
        }));
    }
    agendarRefeicao(schedule, captcha) {
        const headers = [['Cookie', `JSESSIONID=${schedule.session}`]];
        let bodyRequest = queryString.stringify({
            'restaurante': schedule.restaurante,
            'periodo.inicio': schedule.dia,
            'periodo.fim': schedule.dia,
            'captcha': captcha,
            'save': ''
        });
        console.log('Agendando Refeição - CAPTCHA: ', captcha);
        if (Array.isArray(schedule.refeicao)) {
            for (const refeicao of schedule.refeicao) {
                bodyRequest += `&tiposRefeicao=${refeicao}`;
            }
        }
        else {
            bodyRequest += `&tiposRefeicao=${schedule.refeicao}`;
        }
        const requestConfig = {
            body: bodyRequest,
            headers,
            referrer: 'https://portal.ufsm.br/ru/usuario/agendamento/form.html',
            url: 'https://portal.ufsm.br/ru/usuario/agendamento/form.html'
        };
        return this.requestService.makeRequest(requestConfig).pipe(operators_1.switchMap(res => {
            if (res.status !== 200) {
                throw new schedule_exception_1.ScheduleException('Error on schedule meal', schedule_exception_1.ScheduleExceptionType.GENERIC);
            }
            return rxjs_1.from(res.text()).pipe(operators_1.switchMap(html => this.throwIfErrorOnHTML(html)), operators_1.mapTo(res));
        }));
    }
    throwIfErrorOnHTML(html) {
        const afterDeadline = html.match(/O prazo para este agendamento já está esgotado/g);
        const hasSuccess = html.match(/<span class="success pill"/g);
        const alreadyExist = html.match(/Já existe um agendamento com estes dados/g);
        const errorCaptcha = html.match(/Campo inválido/g);
        if (errorCaptcha) {
            throw new schedule_exception_1.ScheduleException('Error on Captcha', schedule_exception_1.ScheduleExceptionType.CAPTCHA_ERROR);
        }
        if (hasSuccess == null || afterDeadline || alreadyExist || errorCaptcha) {
            throw new schedule_exception_1.ScheduleException('Not able to schedule the attempted day', schedule_exception_1.ScheduleExceptionType.NON_RETRIABLE);
        }
        return rxjs_1.of(undefined);
    }
    scheduleTheMeal(schedule, student) {
        console.log(`Agendando para ${schedule.matricula}: ${schedule.dia}`);
        return this.tesseractService.getCaptchaSchedule(schedule.session)
            .pipe(operators_1.switchMap(captcha => this.agendarRefeicao(schedule, captcha)), operators_1.mapTo(schedule));
    }
    logOut(session) {
        const headers = [['Cookie', session]];
        const requestConfig = {
            headers,
            url: 'https://portal.ufsm.br/ru/logout.html',
            referrer: '',
        };
        this.requestService.makeRequest(requestConfig).subscribe(() => {
            console.log('Sucesso ao fazer logout');
        }, () => {
            console.log('Erro ao fazer login');
        });
    }
    getStudentNameAndCourse(matricula, session) {
        return rxjs_1.of(undefined);
        const requestConfig = {
            headers: [['Cookie', session]],
            body: `callCount=1\nnextReverseAjaxIndex=0\nc0-scriptName=usuarioRuCaptchaAjaxService\nc0-methodName=search\nc0-id=0\nc0-param0=number:0\nc0-param1=number:10\nc0-e1=string:${matricula}\nc0-e2=string:CAPTCHA\nc0-e3=null:null\nc0-e4=null:null\nc0-param2=Object_Object:{matricula:reference:c0-e1, captcha:reference:c0-e2, orderBy:reference:c0-e3, orderMode:reference:c0-e4}\nbatchId=2\ninstanceId=0\npage=/ru/usuario/transferencia/credito/form.html\nscriptSessionId=5000E7D9FF69206B62CD4E56F325D285348\n`,
            referrer: 'https://portal.ufsm.br/ru/usuario/transferencia/credito/form.html',
            url: 'https://portal.ufsm.br/ru/dwr/call/plaincall/usuarioRuCaptchaAjaxService.search.dwr',
        };
        return this.requestService.makeRequest(requestConfig).pipe(operators_1.switchMap(async (response) => {
            const body = await response.text();
            console.log(body, session);
            const info = {
                nome: this.getProperty(body, 'nome'),
                curso: this.getProperty(this.getProperty(body, 'unidade', false), 'nome')
            };
            info.nome = this.unscapeUnicode(info.nome);
            info.curso = this.unscapeUnicode(info.curso);
            return info;
        }));
    }
    unscapeUnicode(text) {
        return decodeURIComponent(JSON.parse(`"${text}"`));
    }
    getProperty(data, label, isString = true) {
        const sizeSlice = label.length + 1;
        const regExpProp = isString ? `${label}:"(.*?)"` : `${label}:{(.*?)}`;
        let result = data.match(RegExp(regExpProp))[0].slice(sizeSlice);
        if (isString) {
            return result.replace(new RegExp('"', 'g'), '');
        }
        return result;
    }
};
RestaurantService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [request_service_1.RequestService,
        tesseract_service_1.TesseractService])
], RestaurantService);
exports.RestaurantService = RestaurantService;
//# sourceMappingURL=restaurant.service.js.map