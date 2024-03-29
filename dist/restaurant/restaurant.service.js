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
        return this.requestService.makeRequest(requestConfig).pipe(operators_1.mergeMap(res => {
            if (res.status !== 200) {
                return rxjs_1.throwError('Error on schedule meal');
            }
            return rxjs_1.from(res.text()).pipe(operators_1.mergeMap(html => {
                if (this.hasErrorOnHtml(html)) {
                    return rxjs_1.throwError('Error on Captcha');
                }
                return rxjs_1.of(res);
            }));
        }));
    }
    hasErrorOnHtml(html) {
        const captchaReg = new RegExp(/<span class="success pill"/g);
        const scheduledAlready = new RegExp(/Já existe um agendamento com estes dados/g);
        const invalidField = new RegExp(/Campo inválido/g);
        const hasSuccess = html.match(captchaReg);
        const alreadyExist = html.match(scheduledAlready);
        const errorCaptcha = html.match(invalidField);
        if (hasSuccess === null || alreadyExist != null || errorCaptcha != null) {
            return true;
        }
        return false;
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
};
RestaurantService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [request_service_1.RequestService,
        tesseract_service_1.TesseractService])
], RestaurantService);
exports.RestaurantService = RestaurantService;
//# sourceMappingURL=restaurant.service.js.map